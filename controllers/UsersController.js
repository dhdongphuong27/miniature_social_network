const User = require('../models/User');
var multiparty = require('multiparty');
var fs = require('fs');
var mv = require('mv');
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
    settings(req, res){
        var path = "";
        const form = new multiparty.Form()
        form.parse(req, (err, fields, files) => {
            if (files.avatar) {
                files.avatar.forEach(file => {
                    const uploadImageDir = './public/uploads';
                    if (!fs.existsSync(uploadImageDir)) {
                        fs.mkdirSync(uploadImageDir)
                    }
                    const dir = uploadImageDir + '/' + Date.now();
                    path = dir + '/' + file.originalFilename;
                    fs.mkdirSync(dir);
                    mv(file.path, path, function () {

                    });
                })
            }else {
                path = getUserfromSession(req).avatar
            }
            var ObjectID = require('mongodb').ObjectID;
            User.updateOne(
                { "_id": ObjectID(getUserfromSession(req)._id) },
                {
                    $set: {
                        name: fields.name[0],
                        class: fields.class[0],
                        faculty: fields.faculty[0],
                        phone: fields.phone[0],
                        password: fields.password[0],
                        avatar: path
                    }
                }
            ).then((obj) => {
                res.json({ success: 'true' });
            }).catch((err) => {
                res.json({ success: 'false' });
            })
        })
    }
}
module.exports = new UsersController()