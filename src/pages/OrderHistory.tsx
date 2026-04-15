import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShoppingBag, ChevronDown, ChevronUp, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                navigate('/login');
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        order_items (
                            *,
                            products (
                                name,
                                images,
                                price
                            )
                        )
                    `)
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setOrders(data || []);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    const toggleOrder = (orderId: string) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'shipped': return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'completed': return 'text-green-600 bg-green-50 border-green-200';
            case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid': return '已付款';
            case 'shipped': return '已發貨';
            case 'completed': return '已完成';
            case 'cancelled': return '已取消';
            default: return '待付款';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-4 h-4 mr-1" />;
            case 'shipped': return <Truck className="w-4 h-4 mr-1" />;
            case 'completed': return <CheckCircle className="w-4 h-4 mr-1" />;
            case 'cancelled': return <XCircle className="w-4 h-4 mr-1" />;
            default: return <Clock className="w-4 h-4 mr-1" />;
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
                    <div className="w-full space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-100 rounded-lg w-full"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 min-h-[60vh]">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">我的訂單歷史</h1>

            {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-medium text-gray-900 mb-2">您還沒有訂單</h2>
                    <p className="text-gray-500 mb-8">快去挑選喜歡的商品吧！</p>
                    <Link 
                        to="/products" 
                        className="bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition-colors"
                    >
                        開始購物
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Order Header */}
                            <div 
                                className="p-4 md:p-6 cursor-pointer bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                                onClick={() => toggleOrder(order.id)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`text-xs px-2 py-1 rounded-full border flex items-center ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {getStatusText(order.status)}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="font-mono text-xs text-gray-400">訂單編號: {order.id}</p>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">總金額</p>
                                        <p className="text-lg font-bold text-gray-900">HK$ {order.total_amount}</p>
                                    </div>
                                    {expandedOrder === order.id ? (
                                        <ChevronUp className="text-gray-400" />
                                    ) : (
                                        <ChevronDown className="text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {/* Order Details (Expanded) */}
                            {expandedOrder === order.id && (
                                <div className="border-t border-gray-100 bg-gray-50 p-4 md:p-6 animate-fadeIn">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-4">訂單內容</h4>
                                    <div className="space-y-4">
                                        {order.order_items.map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded border border-gray-100">
                                                <div className="h-16 w-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                                    {item.products?.images && item.products.images.length > 0 ? (
                                                        <img 
                                                            src={JSON.parse(item.products.images[0]).url || item.products.images[0]} 
                                                            alt={item.products.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-gray-100 text-xs text-gray-400">No Img</div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900">{item.products?.name}</h5>
                                                    <p className="text-sm text-gray-500">
                                                        尺寸: {item.selected_size} | 數量: {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-900">HK$ {item.unit_price * item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">收件資訊</h4>
                                            <p className="text-sm text-gray-900">{order.shipping_address?.lastName} {order.shipping_address?.firstName}</p>
                                            <p className="text-sm text-gray-600">{order.shipping_address?.phone}</p>
                                            <p className="text-sm text-gray-600">{order.shipping_address?.address}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;