const User = require('../models/User');

function getUserfromSession(req) {
    if (req.user) {
        return req.user
    }
    else {
        return JSON.parse(req.session.user);
    }
}

class UsersController {
    create(req, res) {
        if (getUserfromSession(req).role==="admin")
        {
            var userid;
            new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                avatar: "/images/facultydefaultavt.png",
                role: "faculty",

            }).save(function (err, user) {
                if (err) {
                    console.log(err);
                    res.json({ success: 'false' });
                } else {
                    userid = user._id;
                    for (var i = 0; i < req.body.categories.length; i++) {
                        User.updateOne(
                            { "_id": userid },
                            {
                                $push: { "permission": { categoryId: req.body.categories[i][0], categoryName: req.body.categories[i][1] } }
                            }
                        ).then((obj) => {
                            
                        }).catch((err) => {
                            console.log(err)
                        })
                    }
                    res.json({ success: 'true' });
                }
            })
        }else{
            res.json({ success: 'false', message: 'You dont have permission'})
        }
    }
}
module.exports = new UsersController()