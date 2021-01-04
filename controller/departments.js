module.exports = (knex, Router) => {
    Router.get('/departments', (req, res) => {
        knex.select('*').from('department').then(data => {
            var object = [];
            data.forEach((item) => {
                object.push(item);
            });
            res.send(object);
        }).catch(err => {
            console.log(err);
        });
    });
    Router.get('/departments/:department_id', (req, res) => {
        knex.select('*').from('department').where('department_id', req.params.department_id)
            .then(data => {
                if (data.length != 0) {
                    res.send(data);
                } else {
                    res.send("id is not valid");
                }
            })
            .catch(err => {
                res.send(err);
                console.log(err);
            });
    });
};