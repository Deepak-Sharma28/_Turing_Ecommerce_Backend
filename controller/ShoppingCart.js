const short = require('short-uuid');


module.exports = (knex, Router) => {
    //for creating a unique cart id

    Router.get('/shoppingcart/generateUniqueId', (req, res) => {
        let uniqueId = short.generate();
        res.send({ "cart_id": uniqueId });
    });

    //for adding a product in shopping cart

    Router.post('/shoppingcart/add', (req, res) => {
        //user already has his cart_id
        var shoppingcart = req.body;
        if (shoppingcart.cart_id !== undefined && shoppingcart.attribute !== undefined && shoppingcart.attribute !== undefined && shoppingcart.Quentity !== undefined && req.body !== {}) {
            knex.select('cart_id').from('shopping_cart').where('cart_id', shoppingcart.cart_id)
                .then(cart => {
                    // console.log(cart);
                    var identifier = {
                        "product_number": shoppingcart.product_id,
                        "value": shoppingcart.attribute
                    };



                    if ((cart[0] == undefined && cart.length == 0) || cart[0].cart_id == shoppingcart.cart_id) {
                        knex.select(
                                'product.product_id',
                                'product.name',
                                'product.price',
                                'attribute_value.value',
                                'product.image')
                            .from('product')
                            .join('product_attribute', 'product.product_id', '=', 'product_attribute.product_id')
                            .join('attribute_value', 'product_attribute.attribute_value_id', '=', 'attribute_value.attribute_value_id')
                            .where({
                                'product.product_id': shoppingcart.product_id,
                                'attribute_value.value': shoppingcart.attribute
                            })
                            .then(product_details => {
                                knex.select('*').from('shopping_cart').where({
                                    'cart_id': shoppingcart.cart_id,
                                    'product_id': shoppingcart.product_id,
                                    'attributes': shoppingcart.attribute
                                }).then(result => {
                                    if (result.length == 0) {
                                        knex('shopping_cart')
                                            .insert({
                                                'cart_id': shoppingcart.cart_id,
                                                'added_on': new Date(),
                                                'product_id': shoppingcart.product_id,
                                                "attributes": product_details[0].value,
                                                "quantity": shoppingcart.Quentity
                                            }).then(inserted => {
                                                knex.select('*').from('shopping_cart').where({
                                                    'cart_id': shoppingcart.cart_id,
                                                    'product_id': shoppingcart.product_id,
                                                    'attributes': shoppingcart.attribute
                                                }).then(response => {
                                                    delete response[0].cart_id;
                                                    delete response[0].buy_now;
                                                    delete response[0].added_on;
                                                    response[0].price = product_details[0].price;
                                                    response[0].subtotal = product_details[0].price * response[0].quantity;
                                                    response[0].image = product_details[0].image;
                                                    res.send(response);
                                                });
                                            }).catch(err => {
                                                res.send(err);
                                            });
                                    } else {
                                        var Quantity = shoppingcart.Quentity + result[0].quantity;
                                        knex('shopping_cart').where({
                                                'cart_id': shoppingcart.cart_id,
                                                'product_id': shoppingcart.product_id,
                                                'attributes': shoppingcart.attribute
                                            }).update('quantity', Quantity)
                                            .then(updated => {
                                                knex.select('*').from('shopping_cart').where({
                                                    'cart_id': shoppingcart.cart_id,
                                                    'product_id': shoppingcart.product_id,
                                                    'attributes': shoppingcart.attribute
                                                }).then(response => {
                                                    delete response[0].cart_id;
                                                    delete response[0].buy_now;
                                                    delete response[0].added_on;
                                                    response[0].price = product_details[0].price;
                                                    response[0].subtotal = product_details[0].price * response[0].quantity;
                                                    response[0].image = product_details[0].image;
                                                    res.send(response);
                                                });
                                            });
                                    }
                                });
                            });
                    } else {
                        res.json({
                            messege: `your cart id is not correct your cart id is`
                        });
                    }
                });
        } else {
            res.json({ message: 'Please fill all the informations' });
        }
    });
    //for getting product details by cart id 
    Router.get('/shoppingcart/:cart_id', (req, res) => {
        console.log(req.params.cart_id);
        if (req.params.cart_id !== undefined) {
            knex
                .select('*').from('shopping_cart').where('cart_id', req.params.cart_id)
                .then(cart => {
                    if (cart.length) {
                        knex
                            .select(
                                'product.product_id',
                                'product.name',
                                'product.price',
                                'attribute_value.value',
                                'product.image')
                            .from('product')
                            .join('product_attribute', 'product.product_id', '=', 'product_attribute.product_id')
                            .join('attribute_value', 'product_attribute.attribute_value_id', '=', 'attribute_value.attribute_value_id')
                            .then(product_details => {
                                for (let customer_cart = 0; customer_cart < cart.length; customer_cart++) {
                                    for (let product = 0; product < product_details.length; product++) {
                                        if (cart[customer_cart].product_id == product_details[product].product_id && cart[customer_cart].attributes == product_details[product].value) {
                                            delete cart[customer_cart].cart_id;
                                            delete cart[customer_cart].buy_now;
                                            delete cart[customer_cart].added_on;
                                            cart[customer_cart].price = product_details[product].price;
                                            cart[customer_cart].image = product_details[product].image;
                                            cart[customer_cart].subtotal = cart[customer_cart].price * cart[customer_cart].quantity;
                                        }
                                    }
                                }

                                res.send(cart);

                            }).catch(err => {
                                res.send(err);
                            });

                    } else {
                        res.send("please check your cart_id");
                    }
                }).catch(err => {
                    res.send(err);
                });
        }
    });

    //for updating a product details in cart

    Router.put('/shoppingcart/update/:item_id', (req, res) => {
        knex.select('*').from('shopping_cart').where('item_id', req.params.item_id)
            .then(result => {
                if (result.length) {
                    var Quantity = req.body.quantity + result[0].quantity;
                    knex('shopping_cart').where('item_id', req.params.item_id)
                        .update({
                            'quantity': Quantity
                        }).then(response => {
                            knex
                                .select(
                                    'product.product_id',
                                    'product.name',
                                    'product.price',
                                    'attribute_value.value as attributes',
                                    'product.image')
                                .from('product')
                                .join('product_attribute', 'product.product_id', '=', 'product_attribute.product_id')
                                .join('attribute_value', 'product_attribute.attribute_value_id', '=', 'attribute_value.attribute_value_id')
                                .where({
                                    'product.product_id': result[0].product_id,
                                    'attribute_value.value': result[0].attributes
                                }).then(product_details => {

                                    product_details[0].quantity = Quantity;
                                    product_details[0].subtotal = product_details[0].price * Quantity;
                                    product_details[0].item_id = result[0].item_id;
                                    res.send(product_details);
                                    console.log("working");
                                }).catch(err => {
                                    res.send(err);
                                });
                        }).catch(err => {
                            res.send(err);
                            console.log(err);
                        });
                } else {
                    res.send("item id is not exists");
                }
            }).catch(err => {
                res.send(err);
                console.log(err);
            });

    });

    //for delete a product from cart

    Router.delete('/shoppingcart/empty/:cart_id', (req, res) => {
        knex('shopping_cart').where('cart_id', req.params.cart_id)
            .del()
            .then(emptyCart => {
                console.log(emptyCart);
                res.send("Cart is Empty");
            }).catch(err => {
                res.send(err);
                console.log(err);
            });
    });
    //for saving product for later
    Router.get('/shoppingcart/saveForlater/:item_id', (req, res) => {
        knex('shopping_cart').where('item_id', req.params.item_id)
            .then(cart_details => {
                if (cart_details.length) {
                    knex('save_cart').insert(cart_details[0])
                        .then(() => {
                            knex('shopping_cart').where('item_id', req.params.item_id)
                                .del()
                                .then(() => {
                                    res.send({
                                        "messege": 'your product has saved for later'
                                    });
                                });
                        }).catch(err => {
                            res.send(err);
                            console.log(err);
                        });
                } else {
                    res.send("your item id is wrong or you do not have any product in cart");
                }
            }).catch(err => {
                res.send(err);
                console.log(err);
            });
    });

    //for moving a product to cart from pending

    Router.get('/shoppingcart/moveTocart/:item_id', (req, res) => {
        knex('save_cart').where('item_id', req.params.item_id)
            .then(move_to_cart => {
                if (move_to_cart.length) {
                    delete move_to_cart[0].s_no;
                    knex('shopping_cart').insert(
                            move_to_cart[0])
                        .then(() => {
                            knex('save_cart')
                                .where('item_id', req.params.item_id)
                                .del()
                                .then(() => {
                                    res.send({ "messege": "your product has moved into cart" });
                                }).catch(err => {
                                    res.send(err);
                                    console.log(err);
                                });
                        }).catch(err => {
                            res.send(err);
                            console.log(err);
                        });
                } else {
                    res.send("item is not available")
                }

            }).catch(err => {
                res.send(err);
            });
    });

    //for getting all the saved products

    Router.get('/shoppingcart/getSaved/:cart_id', (req, res) => {
        knex('save_cart').where('cart_id', req.params.cart_id)
            .then(cart_details => {
                knex.select('save_cart.item_id',
                        'save_cart.attributes',
                        'product.name',
                        'product.price'
                    ).from('save_cart')
                    .join('product', 'save_cart.product_id', '=', 'product.product_id')
                    .where('save_cart.cart_id', req.params.cart_id)
                    .then(saved => {
                        res.send(saved[0]);
                    }).catch(err => {
                        res.send(err);
                    });
            }).catch(err => {
                res.send(err);
            });
    });

    //for getiign total amount of a product

    Router.get('/shoppingcart/totalAmount/:cart_id', (req, res) => {
        knex.select('price', 'quantity').from('product')
            .join('shopping_cart', 'shopping_cart.product_id', '=', 'product.product_id')
            .where('cart_id', req.params.cart_id)
            .then(product_list => {
                let total = 0;
                for (let products of product_list) {
                    total = products.quantity * products.price;
                }

                res.send({ "totalAmount": total });
            }).catch(err => {
                res.send(err);
            });
    });

    //for removing a product from cart
    Router.delete('/shoppingcart/removeProduct/:item_id', (req, res) => {
        knex('shopping_cart').where('item_id', req.params.item_id)
            .del()
            .then(emptyCart => {
                console.log(emptyCart);
                if (emptyCart) {
                    res.send({
                        messege: "product has removed "
                    });
                } else {
                    res.send({
                        messege: "item has no found "
                    });
                }
            })
            .catch(err => {
                res.send(err);
            });
    });


};