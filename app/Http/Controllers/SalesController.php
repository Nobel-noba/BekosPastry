<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductTransfer;
use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Models\Wastage;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SalesController extends Controller
{
    /**
     * Display the Point of Sale (POS) & Counter Terminal.
     */
    public function pos(): Response
    {
        $products = Product::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'category' => $p->category,
                    'description' => $p->description,
                    'selling_price' => (float) $p->selling_price,
                    'current_display_stock' => (int) $p->current_display_stock,
                    'shelf_life_days' => (int) $p->shelf_life_days,
                    'image_url' => $p->image_url,
                ];
            });

        $pendingTransfers = ProductTransfer::with(['product', 'chef'])
            ->where('status', 'pending')
            ->latest()
            ->get();

        $todayOrdersCount = SalesOrder::whereDate('created_at', Carbon::today())->count();
        $todayRevenue = (float) SalesOrder::where('status', 'completed')
            ->whereDate('created_at', Carbon::today())
            ->sum('total_amount');

        return Inertia::render('Sales/POS', [
            'products' => $products,
            'pending_transfers' => $pendingTransfers,
            'today_summary' => [
                'orders_count' => $todayOrdersCount,
                'revenue' => $todayRevenue,
            ],
        ]);
    }

    /**
     * Process POS Checkout and create Sales Order.
     */
    public function checkout(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:100',
            'customer_phone' => 'nullable|string|max:50',
            'payment_method' => 'required|in:cash,card,mobile_money',
            'discount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        $subtotal = 0;
        foreach ($validated['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);
            if ($product->current_display_stock < $item['quantity']) {
                return back()->with('error', "Insufficient counter stock for {$product->name}. Only {$product->current_display_stock} available.");
            }
            $subtotal += ($item['unit_price'] * $item['quantity']);
        }

        $discount = (float) ($validated['discount'] ?? 0);
        $tax = round(($subtotal - $discount) * 0.08, 2); // 8% sales tax
        $total = round($subtotal - $discount + $tax, 2);

        DB::transaction(function () use ($validated, $subtotal, $discount, $tax, $total) {
            $order = SalesOrder::create([
                'order_number' => 'ORD-'.date('Ymd').'-'.strtoupper(Str::random(4)),
                'cashier_id' => Auth::id(),
                'customer_name' => $validated['customer_name'] ?? 'Walk-in Customer',
                'customer_phone' => $validated['customer_phone'] ?? null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total_amount' => $total,
                'payment_method' => $validated['payment_method'],
                'status' => 'completed',
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $itemSubtotal = round($item['quantity'] * $item['unit_price'], 2);

                SalesOrderItem::create([
                    'sales_order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $itemSubtotal,
                ]);

                // Decrement display counter stock
                $product = Product::find($item['product_id']);
                $product->decrement('current_display_stock', $item['quantity']);
            }
        });

        return back()->with('success', "Sale completed! Order #{$validated['payment_method']} processed. Display stock updated.");
    }

    /**
     * View transfers from Kitchen.
     */
    public function transfers(): Response
    {
        $transfers = ProductTransfer::with(['product', 'chef', 'sales'])
            ->latest()
            ->get();

        return Inertia::render('Sales/Transfers', [
            'transfers' => $transfers,
        ]);
    }

    /**
     * Cashier receives and verifies incoming pastry transfer from kitchen into display stock.
     */
    public function receiveTransfer(Request $request, ProductTransfer $transfer): RedirectResponse
    {
        if ($transfer->status !== 'pending') {
            return back()->with('error', 'This transfer has already been processed.');
        }

        DB::transaction(function () use ($transfer) {
            $transfer->update([
                'status' => 'received',
                'sales_id' => Auth::id(),
                'received_at' => Carbon::now(),
            ]);

            // Add quantity to Sales Counter display stock
            $transfer->product->increment('current_display_stock', $transfer->quantity);
        });

        return back()->with('success', "Received {$transfer->quantity} {$transfer->product->name} into front display stock.");
    }

    /**
     * Display counter wastage view.
     */
    public function wastage(): Response
    {
        $products = Product::where('is_active', true)->orderBy('name')->get();
        $counterWastages = Wastage::with(['product', 'reporter'])
            ->where('stage', 'sales_counter')
            ->latest()
            ->get();

        return Inertia::render('Sales/Wastage', [
            'products' => $products,
            'wastages' => $counterWastages,
        ]);
    }

    /**
     * Cashier logs unsold expired or damaged counter pastries at end-of-day.
     */
    public function storeWastage(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if ($product->current_display_stock < $validated['quantity']) {
            return back()->with('error', "Cannot waste more than available counter stock ({$product->current_display_stock}).");
        }

        DB::transaction(function () use ($product, $validated) {
            $costLoss = round((float) $product->estimated_cost * $validated['quantity'], 2);

            // Deduct from front counter display stock
            $product->decrement('current_display_stock', $validated['quantity']);

            Wastage::create([
                'tracking_code' => 'WASTE-'.date('Ymd').'-'.strtoupper(Str::random(4)),
                'stage' => 'sales_counter',
                'ingredient_id' => null,
                'product_id' => $product->id,
                'quantity' => $validated['quantity'],
                'unit' => 'pcs',
                'cost_loss' => $costLoss,
                'potential_product_loss_qty' => $validated['quantity'],
                'reason' => $validated['reason'],
                'reported_by' => Auth::id(),
                'notes' => $validated['notes'],
            ]);
        });

        return back()->with('success', "Counter wastage recorded. Deducted {$validated['quantity']} {$product->name} from display stock.");
    }

    /**
     * Daily Shift and Sales Report.
     */
    public function shiftReport(): Response
    {
        $todayOrders = SalesOrder::with(['items.product', 'cashier'])
            ->whereDate('created_at', Carbon::today())
            ->latest()
            ->get();

        $totalRevenue = (float) $todayOrders->where('status', 'completed')->sum('total_amount');
        $totalItemsSold = $todayOrders->where('status', 'completed')->sum(function ($order) {
            return $order->items->sum('quantity');
        });

        $byPaymentMethod = [
            'cash' => (float) $todayOrders->where('payment_method', 'cash')->sum('total_amount'),
            'card' => (float) $todayOrders->where('payment_method', 'card')->sum('total_amount'),
            'mobile_money' => (float) $todayOrders->where('payment_method', 'mobile_money')->sum('total_amount'),
        ];

        return Inertia::render('Sales/ShiftReport', [
            'orders' => $todayOrders,
            'summary' => [
                'total_orders' => $todayOrders->count(),
                'total_revenue' => $totalRevenue,
                'total_items_sold' => $totalItemsSold,
                'by_payment_method' => $byPaymentMethod,
            ],
        ]);
    }
}
