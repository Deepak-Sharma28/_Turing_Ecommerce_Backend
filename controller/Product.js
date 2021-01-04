module.exports = (knex, Router, isVerify) => {


    //for getting list of products according to user decided limit and items

    Router.get('/products', (req, res) => {
        knex.select("product_id",
                "name",
                "description",
                "price",
                "discounted_price",
                "thumbnail"
            ).from('product ')
            .then(data => {
                let page;
                let limit;

                if (req.query.page == undefined) {
                    page = 1;
                } else {
                    page = req.query.page;
                }
                if (req.query.limit == undefined) {
                    limit = 20;
                } else {
                    limit = req.query.limit;
                }


                let obj = {};
                obj.count = data[data.length - 1].product_id;
                obj.rows = [];
                let start = parseInt(page) * parseInt(limit) - parseInt(limit);
                let stop = parseInt(page) * parseInt(limit);

                for (start; start < stop; start++) {
                    if (typeof(data[start]) !== 'undefined') {
                        console.log(typeof(data[start]));
                        obj.rows.push(data[start]);
                    }
                }
                res.send(obj);
            }).catch(err => {
                res.send(err);
            });
    });

    //for getting products by search


    Router.get('/products/search', (req, res) => {
        var query = req.query.query;
        console.log(typeof(query));
        knex.select("product_id",
                "name",
                "description",
                "price",
                "discounted_price",
                "thumbnail")
            .from("product")
            .where('name', 'like', '%' + query)
            .orWhere('name', 'like', query + '%')
            .where('name', 'like', '%' + query + '%')
            .orWhere('name', query)
            .then(data => {
                res.send({ count: data.length, rows: data });
            }).catch(err => {
                res.send(err);
            });
    });




    //for getting products via product

    Router.get('/products/:product_id', (req, res) => {
        knex.select('*').from('product').where('product_id', req.params.product_id)
            .then(data => {
                res.send(data[0]);
            }).catch(err => {
                res.send(err);
            });
    });



    //for getting products by category id

    Router.get('/products/inCategory/:category_id', (req, res) => {
        knex.select(
                'product.product_id',
                'product.name',
                'product.description',
                'product.price',
                'product.discounted_price',
                'product.image',
                'product.image_2',
                'product.thumbnail',
                'product.display',
                'product_category.category_id'
            )
            .from('product')
            .join('product_category', 'product.product_id', '=', 'product_category.product_id')
            .where('category_id', req.params.category_id)
            .then(data => {
                res.send({
                    count: data.length,
                    rows: data
                });
            })
            .catch(err => {
                res.send(err);
            });
    });


    //for getting products by department id

    Router.get('/products/inDepartment/:department_id', (req, res) => {
        knex.select(
                'product.product_id',
                'product.name',
                'product.description',
                'product.price',
                'product.discounted_price',
                'product.thumbnail'
            )
            .from('product')
            .join('product_category', 'product.product_id', '=', 'product_category.product_id')
            .join('category', 'product_category.category_id', '=', 'category.category_id')
            .where('department_id', req.params.department_id)
            .then(data => {
                res.send({
                    count: data.length,
                    rows: data
                });
            })
            .catch(err => {
                res.send(err);
            });
    });



    //for getting producs details

    Router.get('/products/:product_id/details', (req, res) => {
        knex.select('product_id', 'name', 'description', 'price', 'discounted_price', 'image', 'image_2')
            .from('product')
            .where('product_id', req.params.product_id)
            .then(product => {
                res.send(product);
            }).catch(err => {
                res.send(err);
            });
    });




    //for getting locations

    Router.get('/products/:product_id/locations', (req, res) => {
        knex.select('category.department_id',
                'category.name as category_name',
                'department.name as department_name',
                'category.category_id'
            ).from('product_category')
            .join('category', 'category.category_id', '=', 'product_category.category_id')
            .join('department', 'category.department_id', '=', 'department.department_id')
            .where('product_id', req.params.product_id)
            .then(data => {
                res.send(data);
            }).catch(err => {
                res.send(err);
            });
    });


    //for adding reviews

    Router.post('/products/:product_id/reviews', isVerify, (req, res) => {

        let customer_review = req.body;
        let query = {
            "customer_id": req.customerInfo[0].customer_id,
            "product_id": req.params.product_id
        };
        if (req.body.review !== undefined && req.body.rating !== undefined) {
            console.log(query);
            knex('review').where(query)
                .then(customer_data => {

                    if (customer_data.length) {
                        let updated_review = {
                            review: req.body.review,
                            rating: req.body.rating,
                            created_on: new Date()
                        };
                        knex('review')
                            .where(query)
                            .update(updated_review)
                            .then(() => {
                                res.send({ message: 'Review updated successfully' });
                            });
                    } else {

                        customer_review.customer_id = req.customerInfo[0].customer_id;

                        customer_review.product_id = req.params.product_id;

                        customer_review.created_on = new Date();

                        knex('review').insert(customer_review)
                            .then(() => {
                                res.send({ message: "review has added successfully" });
                            });
                    }
                }).catch(err => {
                    console.log();
                    res.send(err);
                    console.log(err);
                });
        } else {
            res.send("please fill the review and rating");
        }

    });


    //for getting reviews

    Router.get('/products/:product_id/reviews', (req, res) => {
        knex.select('customer.name',
                'review.review',
                'review.rating',
                'review.created_on'
            )
            .from('customer')
            .join('review', 'customer.customer_id', '=', 'review.customer_id')
            .where('product_id', req.params.product_id)
            .then(reviews => {
                res.send(reviews);
            }).catch(err => {
                res.send(err);
            });
    });



};