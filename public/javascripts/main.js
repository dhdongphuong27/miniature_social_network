function toggleFormEdit(e) {
    const formEdit = e.currentTarget.parentNode.parentNode.parentNode
        .parentNode.parentNode.parentNode.querySelector(".editPostForm");
    const content = e.currentTarget.parentNode.parentNode.parentNode
        .parentNode.parentNode.parentNode.querySelector(".status");
    content.style.display = "none";
    formEdit.style.display = 'block';
}
function deletePost(e){
    const postId = e.currentTarget.name;
    console.log(postId);
    const post = e.currentTarget.parentNode.parentNode.parentNode
        .parentNode.parentNode.parentNode;
    let data = {
        postid: postId,
    }
    fetch('/posts/deletepost', {
        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    }).then(response => {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: + response.status')
            return;
        }
        // Examine the text in the response
        response.json().then(function (data) {
            if (data.success == 'true') {
                console.log("delete successfully")
                post.remove();
            } else {
                alert(data.err)
            }
        });

    })

}
function deleteComment(e) {
    const btn = e.currentTarget;
    const cmt = btn.parentNode.parentNode.parentNode.parentNode.parentNode
    let data = {
        commentid: btn.name,
    }
    fetch('/comments/deletecomment', {
        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    }).then(response => {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: + response.status')
            return;
        }
        // Examine the text in the response
        response.json().then(function (data) {
            if (data.success == 'true') {
                console.log("delete successfully")
                cmt.remove();
            } else {
                alert(data.err)
            }
        });
    })
}
function editPost(e){
    e.preventDefault();
    const form = e.currentTarget.parentNode;
    const content = e.currentTarget.parentNode.parentNode.childNodes[1];
    const editcontentsection = e.currentTarget.parentNode.childNodes[1];
    let data = {
        postid: editcontentsection.name,
        editcontent: editcontentsection.value,
    }
    fetch('/posts/editpost', {
        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    }).then(response => {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: + response.status')
            return;
        }
        // Examine the text in the response
        response.json().then(function (data) {
            if (data.success == 'true') {
                content.innerHTML = editcontentsection.value;
                form.style.display = 'none';
                content.style.display = 'block';
            } else {
                alert(data.err)
            }
        });

    })
}
function postComment(e) {
    e.preventDefault();
    const btn = e.currentTarget;
    const commentContentSection = e.currentTarget.parentNode.childNodes[1];
    if (commentContentSection.value===""){
        return
    }
    let data = {
        postid: commentContentSection.name,
        commentcontent: commentContentSection.value,
    }
    fetch('/comments/create', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    }).then(response => {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: + response.status')
            return;
        }
        // Examine the text in the response
        response.json().then(function (data) {
            if (data.success == 'true') {
                var temp = document.getElementsByTagName("template");
                var clone = temp[1].content.cloneNode(true);
                clone.querySelector(".avatar").src = document.getElementById("avt").src;
                clone.querySelector(".display-name").innerHTML = document.getElementById('username').innerHTML.trim();
                clone.querySelector(".profilelink").href = "/users/userid/" + "";
                clone.querySelector(".commentcontent").innerHTML = commentContentSection.value;
                clone.querySelector(".deleteCmtBtn").addEventListener('click', e => deleteComment(e))
                clone.querySelector(".deleteCmtBtn").name = data.commentid;
                btn.parentNode.parentNode.querySelector('.comment-container').append(clone)
                commentContentSection.value = ""
            } else {
                alert(data.err)
            }
        });

    })
    return;
}
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
function showComments(e) {
    const btn = e.currentTarget;
    fetch("/comments/list/postid/" + btn.name).then(response => {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code:' + response.status)
            return;
        }
        response.json().then(data => {
            for (let i = 0; i < data.length; i++) {
                var temp = document.getElementsByTagName("template");
                var clone = temp[1].content.cloneNode(true);
                clone.querySelector(".avatar").src = data[i].ownerAvatar;
                clone.querySelector(".display-name").innerHTML = data[i].ownerName;
                clone.querySelector(".profilelink").href = "/users/userid/" + data[i].ownerId;
                clone.querySelector(".commentcontent").innerHTML = data[i].content;
                clone.querySelector(".deleteCmtBtn").name = data[i]._id;
                btn.parentNode.parentNode.querySelector('.comment-container').append(clone)
            }
            const deleteCommentBtns = [].slice.call(document.getElementsByClassName('deleteCmtBtn'))
            deleteCommentBtns.forEach(button => {
                button.addEventListener('click', e => deleteComment(e))
            })
        })
    })

    btn.parentNode.querySelector(".hideCommentsBtn").style.display = "block";
    btn.style.display = "none";
}
function hideComments(e){
    const btn = e.currentTarget;
    removeAllChildNodes(btn.parentNode.parentNode.querySelector('.comment-container'));
    btn.parentNode.querySelector(".showCommentsBtn").style.display = "block";
    btn.style.display = "none";
}
function getPosts(route,prepend) {
    fetch(route).then(response => {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: + response.status')
            return;
        }
        response.json().then(data => {
            for (let i = 0; i < data.length; i++) {
                var temp = document.getElementsByTagName("template");
                var clone = temp[0].content.cloneNode(true);
                var nameEl = clone.querySelector(".display-name");
                nameEl.innerHTML = data[i].ownerName;
                var profileLinkEl = clone.querySelector(".profilelink")
                profileLinkEl.href = "/users/userid/" + data[i].ownerId;
                var statusEl = clone.querySelector(".statuscontent");
                statusEl.innerHTML = data[i].content;
                var editEl = clone.querySelector(".editcontent");
                editEl.value = data[i].content;
                editEl.name = data[i]._id;
                var commentEl = clone.querySelector(".commentContent");
                commentEl.name = data[i]._id;
                var editPostForm = clone.querySelector(".editPostForm")
                editPostForm.style.display = "none";
                var avatarEl = clone.querySelector(".avatar");
                avatarEl.src = data[i].ownerAvatar;
                var videoLinkEl = clone.querySelector(".video-link");
                videoLinkEl.href = data[i].videoSrc;
                videoLinkEl.innerHTML = data[i].videoSrc;
                var createdAtEl = clone.querySelector(".created-at");
                createdAtEl.innerHTML = "<i class='fa fa-clock-o'></i> " + moment(data[i].created_at).fromNow();
                createdAtEl.title = moment(data[i].created_at).format('MMMM Do YYYY, h:mm:ss a');
                var showCommentsBtn = clone.querySelector('.showCommentsBtn')
                showCommentsBtn.name = data[i]._id;
                clone.querySelector(".deletePostBtn").name = data[i]._id;
                var postImg = clone.querySelector(".postImg");
                var videoEl = clone.querySelector(".video");
                if (data[i].imageSrc !== "") {
                    var imageSrc = data[i].imageSrc;
                    imageSrc = imageSrc.replace("/public", "");
                    postImg.src = prepend + imageSrc;
                    videoEl.style.display = "none";
                    clone.querySelector(".video-container").style.display = "none";
                } else {
                    postImg.style.display = "none";
                    if (data[i].videoSrc !== "") {
                        var videoSrc = data[i].videoSrc;
                        videoSrc = videoSrc.replace("watch?v=", "embed/");
                        videoEl.src = videoSrc;
                        videoEl.width = "100%";
                    } else {
                        videoEl.style.display = "none";
                        clone.querySelector(".video-container").style.display = "none";
                        statusEl.style.fontSize = "200%";
                    }
                }
                if (data[i].content === "") statusEl.style.display = "none";
                document.getElementById('newsfeed').append(clone);
            }
            const editPostBtns = [].slice.call(document.getElementsByClassName('editPostBtn'))
            editPostBtns.forEach(button => {
                button.addEventListener('click', e => toggleFormEdit(e))
            })
            const savePostBtns = [].slice.call(document.getElementsByClassName('savePostBtn'))
            savePostBtns.forEach(button => {
                button.addEventListener('click', e => editPost(e))
            })
            const deletePostBtns = [].slice.call(document.getElementsByClassName('deletePostBtn'))
            deletePostBtns.forEach(button => {
                button.addEventListener('click', e => deletePost(e))
            })
            const commentBtns = [].slice.call(document.getElementsByClassName('commentBtn'))
            commentBtns.forEach(button => {
                button.addEventListener('click', e => postComment(e))
            })
            const showCommentsBtns = [].slice.call(document.getElementsByClassName('showCommentsBtn'))
            showCommentsBtns.forEach(button => {
                button.addEventListener('click', e => showComments(e))
            })
            const hideCommentsBtns = [].slice.call(document.getElementsByClassName('hideCommentsBtn'))
            hideCommentsBtns.forEach(button => {
                button.addEventListener('click', e => hideComments(e))
            })
        })
    })
}
function getNotifications(notiPageNum, notiLimit){
    fetch("/notifications/list/page/" + notiPageNum + "/limit/" + notiLimit).then(response => {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: + response.status')
            return;
        }
        response.json().then(data => {
            for (let i = 0; i < data.length; i++) {
                var temp = document.getElementsByTagName("template");
                var clone = temp[2].content.cloneNode(true);
                clone.querySelector(".falcutyname").innerHTML = data[i].ownerName;
                clone.querySelector(".contentsummary").innerHTML = data[i].content.slice(0, 70);
                clone.querySelector(".created-at").innerHTML = moment(data[i].created_at).format("Do MMM YYYY");
                clone.querySelector(".notiTitle").href = "/gotothislink";
                clone.querySelector(".notiTitle").innerHTML = data[i].title;
                document.getElementById("notiList").append(clone);
            }
        })
    })
}
function postBtn(e){
    e.preventDefault();
    
    const inputFile = document.getElementById("file-upload");
    if (document.getElementById('postcontent').value === "" &&
        document.getElementById("videoinput").value === "" && inputFile.files.length === 0) {
        console.log("You are not posting anything")
        return
    }
    const formData = new FormData();
    formData.append("content", document.getElementById('postcontent').value);
    formData.append("videoSrc", document.getElementById("videoinput").value);
    formData.append("image", inputFile.files[0]);
    fetch('/posts/create', {
        method: 'POST',
        body: formData
    }).then(response => {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: + response.status')
            return;
        }
        // Examine the text in the response
        response.json().then(function (data) {
            if (data.success == 'true') {
                var temp = document.getElementsByTagName("template");
                var clone = temp[0].content.cloneNode(true);
                var nameEl = clone.querySelector(".display-name");
                nameEl.innerHTML = document.getElementById('username').innerHTML.trim();
                var statusEl = clone.querySelector(".statuscontent");
                console.log(clone)
                statusEl.innerHTML = document.getElementById('postcontent').value;
                var avatarEl = clone.querySelector(".avatar");
                avatarEl.src = document.getElementById("avt").src;
                var editPostForm = clone.querySelector(".editPostForm")
                var profileLinkEl = clone.querySelector(".profilelink")
                profileLinkEl.href = "/users/userid/" + document.getElementById('userid').innerHTML.trim();
                editPostForm.style.display = "none";
                clone.querySelector(".editPostBtn").addEventListener('click', e => toggleFormEdit(e))
                clone.querySelector(".savePostBtn").addEventListener('click', e => editPost(e))
                clone.querySelector(".deletePostBtn").addEventListener('click', e => deletePost(e))
                clone.querySelector(".deletePostBtn").name = data.postid;
                var editEl = clone.querySelector(".editcontent");
                editEl.value = document.getElementById('postcontent').value;
                editEl.name = data.postid;
                var createdAtEl = clone.querySelector(".created-at");
                createdAtEl.innerHTML = "<i class='fa fa-clock-o'></i> " + moment(new Date()).fromNow();
                createdAtEl.title = moment(new Date()).format('MMMM Do YYYY, h:mm:ss a');

                var videoSrc = document.getElementById("videoinput").value
                document.getElementById("videoinput").value = "";
                var videoLinkEl = clone.querySelector(".video-link");
                videoLinkEl.href = videoSrc;
                videoLinkEl.innerHTML = videoSrc;

                var postImg = clone.querySelector(".postImg");
                var videoEl = clone.querySelector(".video");

                if (inputFile.files[0]) {
                    postImg.src = URL.createObjectURL(inputFile.files[0]);
                    inputFile.value = "";
                    videoEl.style.display = "none";
                    clone.querySelector(".video-container").style.display = "none";
                } else {
                    postImg.style.display = "none";
                    if (videoSrc !== "") {
                        videoSrc = videoSrc.replace("watch?v=", "embed/");
                        videoEl.src = videoSrc;
                    } else {
                        videoEl.style.display = "none";
                        clone.querySelector(".video-container").style.display = "none";
                        statusEl.style.fontSize = "200%";
                    }
                }
                document.getElementById('newsfeed').prepend(clone);

                document.getElementById('postcontent').value = '';
            } else {
                // add your code here
            }
        });
    })
}
function createAccount(e){
    e.preventDefault();
    var categories = []
    for (var i = 1; i <= 22; i++) {
        var checkBox = document.getElementById(i.toString())
        if (checkBox.checked) {
            categories.push([i.toString(), checkBox.value]);
        }
    }
    let data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('pwd').value,
        categories: categories
    }
    fetch('/users/createfacultyacc', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    }).then(response => {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: + response.status')
            return;
        }
        response.json().then(function (data) {
            if (data.success == 'true') {
                
            } else {
                alert(data.err)
            }
        });

    })
    
}
function postNoti(e){
    const btn = e.currentTarget;
    var notiTextArea = btn.parentNode.parentNode.parentNode.querySelector("#noticontent")
    const category = document.querySelector("#category")
    let data = {
        categoryName: category.options[category.selectedIndex].text,
        categoryId: category.value,
        title: document.getElementById("title").value,
        content: notiTextArea.value
    }
    fetch('/notifications/create', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    }).then(response => {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: + response.status')
            return;
        }
        response.json().then(function (data) {
            if (data.success == 'true') {
                console.log("Successfully")
                //Empty the textarea and send message to socket.io server 
            } else {
                alert(data.err)
            }
        });

    })
}

$(document).ready(function () {
    var path = window.location.pathname;
    var page = path.split("/").pop();
    if (page=="")
    {
        var pageNum = 1
        const limit = 10
        getPosts("/posts/list/page/" + pageNum + "/limit/" + limit, "");
        window.onscroll = () => {
            if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
                pageNum = pageNum+1;
                getPosts("/posts/list/page/" + pageNum + "/limit/" + limit, "");
            }
        }
        try{ //student
            document.getElementById("postBtn").addEventListener('click', e => postBtn(e));
            document.getElementById('toggleVideoBtn').onclick = function (e) {
                var videoinput = document.getElementById("videoinput");
                if (videoinput.style.display === "none") {
                    videoinput.style.display = "block";
                } else {
                    videoinput.style.display = "none";
                }
            }
            var notiPageNum = 1
            const notiLimit = 10
            getNotifications(notiPageNum, notiLimit);
            const rightSidebar = document.querySelector("#RSidebar .RSidebar-content");
            rightSidebar.onscroll = () => {
                if (rightSidebar.offsetHeight + rightSidebar.scrollTop >= rightSidebar.scrollHeight) {
                    notiPageNum = notiPageNum+1;
                    getNotifications(notiPageNum, notiLimit);
                }
            }
        }catch(e){
            console.log(e)
        }
        try {
            document.getElementById("postNotiBtn").addEventListener('click', e => postNoti(e));
        } catch (e) {

        }
        
    }
    else if (page =="createacc")
    {
        document.getElementById("createBtn").addEventListener('click', e => createAccount(e))
    }
    else
    {  //user profile
        var pageNum = 1
        const limit = 10
        getPosts("/posts/list/userid/"+page+"/page/" + pageNum + "/limit/" + limit, "../.");
        window.onscroll = () => {
            if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
                pageNum = pageNum + 1;
                getPosts("/posts/list/userid/" + page + "/page/" + pageNum + "/limit/" + limit, "../.");
            }
        }
    }
})
