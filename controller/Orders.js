module.exports = (knex, Router, isVerify) => {
    Router.post('/orders', isVerify, (req, res) => {

        //for making a order 

        var order = req.body;
        var cart_id = order.cart_id;
        if ((order.cart_id && order.shipping_id && order.tax_id) !== undefined && order !== {}) {
            knex.select(
                    'shopping_cart.product_id',
                    'shopping_cart.quantity',
                    'shopping_cart.attributes',
                    'product.price as unit_cost',
                    'product.name as product_name'
                ).from('shopping_cart')
                .join('product', 'shopping_cart.product_id', '=', 'product.product_id')
                .where('shopping_cart.cart_id', order.cart_id)
                .then(order_details => {
                    if (order_details.length) {
                        var clone = [];
                        for (let copy of order_details) {
                            clone.push({...copy });
                        }
                        for (let i of clone) {
                            i.customer_id = req.customerInfo[0].customer_id;
                            i.created_on = new Date();
                            i.shipping_id = req.body.shipping_id;
                            i.tax_id = req.body.tax_id;
                            i.total_amount = i.unit_cost * i.quantity;
                            delete i.product_id;
                            delete i.quantity;
                            delete i.attributes;
                            delete i.unit_cost;
                            delete i.product_name;
                        }
                        knex('orders').insert(clone)
                            .then(() => {
                                knex.select('order_id').from('orders')
                                    .where('customer_id', req.customerInfo[0].customer_id)
                                    .then(id_of_order => {
                                        id_of_order.splice(0, id_of_order.length - order_details.length);
                                        for (var i = 0; i < order_details.length; i++) {
                                            order_details[i].order_id = id_of_order[i].order_id;
                                        }

                                        knex('order_detail').insert(order_details)
                                            .then(() => {
                                                knex('shopping_cart').where('cart_id', cart_id)
                                                    .del()
                                                    .then(() => {
                                                        res.send(id_of_order);
                                                    });
                                            }).catch(err => {
                                                res.send(err);
                                                console.log(err);
                                            });
                                    })
                                    .catch(err => {
                                        res.send(err);
                                        console.log(err);
                                    });
                            })
                            .catch(err => {
                                res.send(err);
                                console.log(err);
                            });

                    } else {
                        res.sendStatus(404);
                    }

                })
                .catch(err => {
                    res.send(err);
                    console.log(err);
                });
        } else {
            res.send({
                messege: "please fill all the details"
            });
        }
    });

    //for getting the orders by customer id

    Router.get('/orders/inCustomer', isVerify, (req, res) => {
        knex.select('created_on', 'product_id', 'orders.order_id').from('orders').join('order_detail', 'orders.order_id', '=', 'order_detail.order_id')
            .where('customer_id', req.customerInfo[0].customer_id)
            .then(result => {

                if (result.length) {
                    res.send(result);
                } else {
                    res.sendStatus(404);
                }
            }).catch(err => {
                res.send(err);
            });
    });

    //for getting a shortDetail of order 

    Router.get('/orders/shortDetail/:order_id', isVerify, (req, res) => {
        knex.select('order_id', 'total_amount', 'created_on', 'status').from('orders')
            .where({
                'order_id': req.params.order_id,
                'customer_id': req.customerInfo[0].customer_id
            })
            .then(shortDetail => {
                if (shortDetail.length) {
                    shortDetail[0].status = "paid";
                    shortDetail[0].name = req.customerInfo[0].name;
                    res.send(shortDetail);
                } else {
                    res.send("did not have any order");
                }
            }).catch(err => {
                res.sendStatus(404);
            });
    });
    //for getting order by order id

    Router.get('/orders/:order_id', isVerify, (req, res) => {
        console.log("another");
        knex('order_detail').where('order_id', req.params.order_id)
            .then(order_detail => {
                if (order_detail.length) {
                    delete order_detail[0].item_id;
                    order_detail[0].subtotal = order_detail[0].unit_cost * order_detail[0].quantity;
                    res.send(order_detail);
                } else {
                    res.send({ messege: "please check the order id" });
                }
            })
            .catch(err => {
                res.send(err);
                console.log(err);
            });
    });

};