module.exports = (knex, Router) => {
    //for getting all attributes

    Router.get('/attributes', (req, res) => {
        knex.select('*').from('attribute').
        then(data => {
                res.send(data);
            })
            .catch(err => {
                res.send(err);
            });
    });

    //for getting attributes by attribute Id

    Router.get('/attributes/:attribute_id', (req, res) => {
        knex.select('*').from('attribute').where('attribute_id', req.params.attribute_id)
            .then(data => {
                if (data.length != 0) {
                    res.send(data);
                } else {
                    res.send("Invalid Id")
                }
            }).catch(err => {
                res.send(err);
            });
    });


    //for getting all the attribute values by attributes

    Router.get('/attributes/values/:attribute_id', (req, res) => {
        knex.select('*').from('attribute_value').where('attribute_id', req.params.attribute_id).then(data => {
            if (data.length != 0) {
                data.forEach(async(item) => {
                    await delete item.attribute_id;
                });
                res.send(data);
            } else {
                res.send("Invalid ID");
            }
        }).catch(err => {
            res.send(err);
        });
    });


    //for getting attributes by product ID


    Router.get('/attributes/inProduct/:product_id', (req, res) => {
        knex.select('attribute.name as attribute_name', 'product_attribute.attribute_value_id', 'attribute_value.value as attribute_value')
            .from('product_attribute')
            .join('attribute_value', 'product_attribute.attribute_value_id', '=', 'attribute_value.attribute_value_id')
            .join('attribute', 'attribute.attribute_id', '=', 'attribute_value.attribute_id')
            .where('product_id', req.params.product_id)
            .then(data => {
                res.send(data);
            }).catch(err => {
                res.send(err);
            });
    });
};