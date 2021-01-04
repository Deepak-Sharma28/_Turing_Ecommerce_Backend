module.exports = (knex, Router) => {

    //for getting all the categories

    Router.get('/categories', (req, res) => {
        knex.select('*').from('category')
            .then(data => {
                var categories = {
                    "count": data[data.length - 1].category_id,
                    "rows": data
                };
                res.send(categories);
            })
            .catch(err => {
                res.send(err);
            });
    });

    //for getting category by category id

    Router.get('/categories/:category_id', (req, res) => {
        knex.select('*').from('category').where('category_id', req.params.category_id)
            .then(data => {
                if (data.length != 0) {
                    res.send(data);
                } else {
                    res.send("Id is invalid");
                }
            }).catch(err => {
                console.log(err);
            });
    });

    //for getting category by product Id

    Router.get('/categories/inProduct/:product_id', (req, res) => {
        knex.select('*').from('category').where('category_id', req.params.product_id)
            .then(data => {
                if (data.length != 0) {
                    delete data[0].description;
                    res.send(data);

                } else {
                    res.send("Id is invalid");
                }
            }).catch(err => {
                res.send(err);
            });
    });

    //for getting category in department by department id

    Router.get('/categories/inDepartment/:department_id', (req, res) => {
        knex.select('*').from('category').where('department_id', req.params.department_id)
            .then(data => {
                if (data.length != 0) {
                    res.send(data);
                } else {
                    res.send('Invalid Id');
                }
            })
            .catch(err => {
                res.send(err);
            });
    });
};