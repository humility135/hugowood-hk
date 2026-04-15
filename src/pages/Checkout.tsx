
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise, { stripeEnabled } from '../lib/stripe';

// Checkout Form Component wrapped in Elements
const CheckoutForm = () => {
    const navigate = useNavigate();
    const { items, clearCart, totalPrice } = useCartStore();
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);
    const stripe = useStripe();
    const elements = useElements();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        phone: ''
    });

    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        
        try {
            // Get current user if logged in
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id || null;

            if (paymentMethod === 'card') {
                if (!stripeEnabled) {
                    throw new Error('Stripe is not configured');
                }
                if (!stripe || !elements) {
                    throw new Error('Stripe is not loaded');
                }

                const cardElement = elements.getElement(CardElement);
                if (!cardElement) throw new Error('Card element not found');

                // In a real app with backend, we would create a PaymentIntent here
                // For this demo (static site), we will just tokenize the card to show UI works
                const { error, paymentMethod: stripePaymentMethod } = await stripe.createPaymentMethod({
                    type: 'card',
                    card: cardElement,
                });

                if (error) {
                    throw error;
                }
                
                console.log('Stripe Payment Method created:', stripePaymentMethod);
                // Continue to create order...
            }

            // 1. Create Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_id: userId,
                    total_amount: totalPrice(),
                    status: paymentMethod === 'card' ? 'paid' : 'pending', // Simulate paid if card success
                    shipping_address: formData
                }])
                .select()
                .single();
                
            if (orderError) throw orderError;
            
            // 2. Create Order Items
            const orderItems = items.map(item => ({
                order_id: orderData.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.product?.price || 0,
                selected_size: item.selected_size,
                selected_color: item.selected_color
            }));
            
            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);
                
            if (itemsError) throw itemsError;

            // 3. Decrease Stock Quantity
            for (const item of items) {
                if (item.product?.id) {
                    // Check for variant first
                    let variantUpdated = false;
                    
                    if (item.selected_size && item.selected_color) {
                         const { data: variant } = await supabase
                            .from('product_variants')
                            .select('id, stock_quantity')
                            .eq('product_id', item.product.id)
                            .eq('size', item.selected_size)
                            .eq('color', item.selected_color)
                            .single();
                        
                        if (variant) {
                            const newStock = Math.max(0, variant.stock_quantity - item.quantity);
                            await supabase
                                .from('product_variants')
                                .update({ stock_quantity: newStock })
                                .eq('id', variant.id);
                            variantUpdated = true;
                        }
                    }

                    // Always update parent product stock as well (as a total count)
                    // or if no variant was found/updated, it's the only source of truth
                    const { data: currentProduct } = await supabase
                        .from('products')
                        .select('stock_quantity')
                        .eq('id', item.product.id)
                        .single();
                    
                    if (currentProduct) {
                        const newStock = Math.max(0, currentProduct.stock_quantity - item.quantity);
                        
                        await supabase
                            .from('products')
                            .update({ stock_quantity: newStock })
                            .eq('id', item.product.id);
                    }
                }
            }

            // Success
            setProcessing(false);
            setCompleted(true);
            clearCart();
            
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert('結帳發生錯誤: ' + (error.message || '請稍後再試'));
            setProcessing(false);
        }
    };

    if (completed) {
        return (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100 max-w-2xl mx-auto">
                <div className="flex justify-center mb-4">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">訂單已確認！</h2>
                <p className="text-gray-500 mb-8 text-lg">多謝惠顧。我們會盡快為您出貨。</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-blue-900 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-800 transition-colors"
                >
                    返回首頁
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-8 text-gray-900">結賬</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold mb-4 text-gray-900">收件資訊</h2>
                    <form onSubmit={handlePayment} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">名字</label>
                                <input 
                                    type="text" 
                                    className="w-full border-gray-300 rounded-md border p-2" 
                                    required 
                                    placeholder="John" 
                                    value={formData.firstName}
                                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">姓氏</label>
                                <input 
                                    type="text" 
                                    className="w-full border-gray-300 rounded-md border p-2" 
                                    required 
                                    placeholder="Doe" 
                                    value={formData.lastName}
                                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                            <input 
                                type="text" 
                                className="w-full border-gray-300 rounded-md border p-2" 
                                required 
                                placeholder="九龍旺角彌敦道600號" 
                                value={formData.address}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                            <input 
                                type="tel" 
                                className="w-full border-gray-300 rounded-md border p-2" 
                                required 
                                placeholder="9123 4567" 
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100 mt-4">
                            <h2 className="text-lg font-bold mb-4 text-gray-900">付款方式</h2>
                            <div className="space-y-3">
                                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="cod" 
                                        checked={paymentMethod === 'cod'} 
                                        onChange={() => setPaymentMethod('cod')}
                                        className="mr-3"
                                    />
                                    <span className="font-medium">貨到付款 / 銀行轉帳</span>
                                </label>
                                {stripeEnabled && (
                                    <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            value="card" 
                                            checked={paymentMethod === 'card'} 
                                            onChange={() => setPaymentMethod('card')}
                                            className="mr-3"
                                        />
                                        <span className="font-medium">信用卡 (Stripe)</span>
                                    </label>
                                )}
                            </div>

                            {stripeEnabled && paymentMethod === 'card' && (
                                <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">信用卡資料</label>
                                    <div className="p-3 bg-white border border-gray-300 rounded-md">
                                        <CardElement options={{
                                            style: {
                                                base: {
                                                    fontSize: '16px',
                                                    color: '#424770',
                                                    '::placeholder': {
                                                        color: '#aab7c4',
                                                    },
                                                },
                                                invalid: {
                                                    color: '#9e2146',
                                                },
                                            },
                                        }} />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        注意：此為測試環境，請使用 Stripe 測試卡號 (例如: 4242...4242)
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                                <span>總計</span>
                                <span>HK$ {totalPrice().toFixed(0)}</span>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full bg-orange-600 text-white py-3 rounded-md font-medium hover:bg-orange-700 transition-colors ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {processing ? '處理中...' : (stripeEnabled && paymentMethod === 'card' ? '立即付款' : '確認訂單')}
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg h-fit">
                    <h2 className="text-lg font-bold mb-4 text-gray-900">訂單摘要</h2>
                    <p className="text-sm text-gray-500">
                        您可以在購物車頁面修改商品。
                    </p>
                </div>
            </div>
        </div>
    );
};

const Checkout = () => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    );
};

export default Checkout;
