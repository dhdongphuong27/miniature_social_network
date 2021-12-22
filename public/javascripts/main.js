var followingPosts = [];
var socket = io();
$(document).ready(function () {
    var path = window.location.pathname;
    var page = path.split("/").pop();
    
    

    if (document.querySelector("#userrole").innerHTML =="student"){
        socket.on('notification', function (msg) {
            onNotificationReceived(msg);
            addOneNotification(msg, "new");
        });
    }
    if (page == "" || path.includes("users/userid")){
        socket.on('comment', function (msg) {
            console.log("received comments")
            console.log(followingPosts)
            console.log(msg.postid)
            if (followingPosts.includes(msg.postid)){
                console.log("showing comments")
                onCommentReceived(msg)
            }
        });
    }
    if (page=="")
    {
        var pageNum = 1
        const limit = 10
        getPosts("/posts/list/page/" + pageNum + "/limit/" + limit, "");
        console.log(followingPosts);
        window.onscroll = () => {
            if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
                pageNum = pageNum+1;
                getPosts("/posts/list/page/" + pageNum + "/limit/" + limit, "");
            }
        }
        socket.on('post', function (msg) {
            addOnePost(msg, "new", "");
            followingPosts.push(msg._id)
        });
        try{ //only student run this code
            document.getElementById("postBtn").addEventListener('click', e => postArticle(e));
            document.getElementById('toggleVideoBtn').onclick = function (e) {
                var videoinput = document.getElementById("videoinput");
                if (videoinput.style.display === "none") {
                    videoinput.style.display = "block";
                } else {
                    videoinput.style.display = "none";
                }
            }
            //load notification
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
            
        }
        try {// faculty
            document.getElementById("postNotiBtn").addEventListener('click', e => postNoti(e));
            document.getElementById("postNotiSuccess").onclick = function (e) {
                e.currentTarget.style.display = "none";
            }
            var notiPageNum = 1
            const notiLimit = 10
            getNotifications(notiPageNum, notiLimit);
            const rightSidebar = document.querySelector("#RSidebar .RSidebar-content");
            rightSidebar.onscroll = () => {
                if (rightSidebar.offsetHeight + rightSidebar.scrollTop >= rightSidebar.scrollHeight) {
                    notiPageNum = notiPageNum + 1;
                    getNotifications(notiPageNum, notiLimit);
                }
            }
        } catch (e) {

        }
        
    }
    else if (page == "notifications")
    {
        var category = "";
        var titlesearch = "";
        var contentsearch = "";
        var notiPageNum = 1;
        getSpecificNotifications(category, titlesearch, contentsearch, notiPageNum, 10)
        getNumberofPages();
        document.getElementById("searchNotiBtn").addEventListener('click', e => searchNoti(notiPageNum))
    }
    else if (page =="createacc")
    {
        document.getElementById("createBtn").addEventListener('click', e => createAccount(e))
        document.getElementById("postNotiSuccess").onclick = function (e) {
            e.currentTarget.style.display = "none";
        }
    }
    else if (page =="settings")
    {
        if (document.getElementById("userrole").innerHTML!=="student"){
            document.getElementById("studentOnly").remove();
            document.querySelector("#saveInfo").addEventListener('click', e => saveInfo(e, "faculty"))
        }else{
            document.querySelector("#saveInfo").addEventListener('click', e => saveInfo(e, "student"))
        }
    }
    else
    {  
        if (path.includes("users/userid")) {
            var pageNum = 1
            const limit = 10
            getPosts("/posts/list/userid/" + page + "/page/" + pageNum + "/limit/" + limit, "../.");
            window.onscroll = () => {
                if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
                    pageNum = pageNum + 1;
                    getPosts("/posts/list/userid/" + page + "/page/" + pageNum + "/limit/" + limit, "../.");
                }
            }
            getUserinfo(page);
        }
        if (path.includes("notifications/details")){
            getNotiDetails(page)
        }
    }
    // If image not found
    $("img").each(function (i, ele) {
        $("<img/>").attr("src", $(ele).attr("src")).on('error', function () {
            $(ele).attr("src", "/images/imagenotfound.png");
        })
    });
    $("img").on("error", function () {
        $(this).attr("src", "/images/imagenotfound.png");
    });
})
function saveNoti(e){
    console.log("save")
}
function deleteNoti(e){
    console.log("delete")
}
function onCommentReceived(comment){
    var clone = document.querySelector("#cmtTemplate").content.cloneNode(true);
    clone.querySelector(".avatar").src = comment.ownerAvatar;
    clone.querySelector(".display-name").innerHTML = comment.ownerName;
    clone.querySelector(".profilelink").href = "/users/userid/" + comment.ownerId;
    clone.querySelector(".commentcontent").innerHTML = comment.content;
    clone.querySelector(".deleteCmtBtn").name = comment._id;
    clone.querySelector(".modifyContent").name = comment.ownerId;
    document.getElementById(comment.postid).querySelector(".comment-container").append(clone)
}
function getUserinfo(page){
    fetch("/users/info/userid/" + page).then(response => {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code:' + response.status)
            return;
        }
        response.json().then(data => {
            document.querySelector("#card-inf-mssv").innerHTML = data.email.replace("@student.tdtu.edu.vn", "")
            document.querySelector("#card-inf-faculty").innerHTML = data.faculty;
            document.querySelector("#card-inf-class").innerHTML = data.class;
            document.querySelector("#card-inf-phone").innerHTML = data.phone;
            document.querySelector("#card-inf-email").innerHTML = data.email;
            document.querySelector("#card-inf-name").innerHTML = data.name;
            document.querySelector(".infBody-img").src = data.avatar;
        })
    })
}
function saveInfo(e, role){
    e.preventDefault();
    const formData = new FormData();
    if (role==="student"){
        const inputFile = document.querySelector("#avatarInput");
        formData.append("name", document.querySelector("#nameInput").value)
        formData.append("class", document.querySelector("#classInput").value)
        formData.append("faculty", document.querySelector("#facultyInput").value)
        formData.append("phone", document.querySelector("#phoneInput").value)
        formData.append("password", document.querySelector("#passwordInput").value)
        formData.append("avatar", inputFile.files[0]);
    }else if (role==="faculty"){
        formData.append("password", document.querySelector("#passwordInput").value)
    }
    fetch('/users/settings', {
        method: 'PUT',
        body: formData
    }).then(response => {
        if (response.status !== 200) {
            console.log(response.status)
            return;
        }else{
            var inputFile = document.querySelector("#avatarInput");
            document.querySelector("#username").innerHTML = document.querySelector("#nameInput").value
            if (inputFile.files[0]) {
                document.querySelector("#avt").src = URL.createObjectURL(inputFile.files[0]);
                inputFile.value = "";
            }
        }
    })
    
    
}
function onNotificationReceived(msg){
    var clone = document.querySelector("#popupTemplate").content.cloneNode(true);
    clone.querySelector(".popupnoti").href = "/notifications/details/" + msg._id;
    clone.querySelector(".popupcategoryName").innerHTML = msg.categoryName;
    document.querySelector(".popupnoticontainer").prepend(clone)
    $(".popupnoti:first-child").delay(2000).fadeOut(1000);
}
function getNotiDetails(page){
    fetch("/notifications/notificationid/"+page).then(response =>{
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code:' + response.status)
            return;
        }
        response.json().then(data => {
            document.querySelector("#categoryName").innerHTML = data.categoryName;
            document.querySelector("#rnews-header").innerHTML = data.title;
            document.querySelector("#rnew_content").innerHTML = data.content;
            document.querySelector("#editNotiTitle").value = data.title;
            document.querySelector("#editNotiContent").value = data.content;
        })
    })
}   
function getNumberofPages(){
    fetch("/notifications/numpage").then(response =>{
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code:' + response.status)
            return;
        }
        response.json().then(data => {
            var num = parseInt(data)
            var page = Math.ceil(num / 10)
            for (var i = 1; i <= page; i++){
                var clone = document.querySelector("#pagingTemplate").content.cloneNode(true);
                var btn = clone.querySelector(".btn")
                if(i==1){
                    $(btn).addClass("active");
                }
                btn.innerHTML = i;
                btn.addEventListener('click', e => loadPage(e))
                document.querySelector(".page").append(clone)
            }
        })
    })
}
function loadPage(e) {
    $(".btn-page").removeClass("active");
    $(e.currentTarget).addClass("active");
    category = document.querySelector("#category").value;
    titlesearch = document.querySelector("#titlesearch").value;
    contentsearch = document.querySelector("#contentsearch").value;
    getSpecificNotifications(category, titlesearch, contentsearch, e.currentTarget.innerHTML, 10);
}
function searchNoti(notiPageNum){
    category = document.querySelector("#category").value;
    titlesearch = document.querySelector("#titlesearch").value;
    contentsearch = document.querySelector("#contentsearch").value;
    getSpecificNotifications(category, titlesearch, contentsearch, notiPageNum, 10)
}
function getSpecificNotifications(facultyid, title, content, notiPageNum, notiLimit){
    if (facultyid === "") facultyid = "-";
    if (title === "") title = "-";
    if (content === "") content = "-";
    removeAllChildNodes(document.querySelector("#notificationlist"))
    fetch("/notifications/slist/facultyid/"+facultyid+"/title/"+title+"/content/"+content+"/page/" + notiPageNum + "/limit/" + notiLimit)
    .then(response => {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code:' + response.status)
            return;
        }
        response.json().then(data => {
            for (let i = 0; i < data.length; i++) {
                var clone = document.querySelector("#notificationTemplate").content.cloneNode(true);
                clone.querySelector(".notiTitle").innerHTML = data[i].title;
                clone.querySelector(".desc").innerHTML = data[i].content;
                clone.querySelector(".created-at").innerHTML = moment(data[i].created_at).format('MMMM Do YYYY');
                clone.querySelector(".categoryName").innerHTML = data[i].categoryName;
                clone.querySelector(".notiDetail").href = "/notifications/details/"+data[i]._id;
                document.querySelector("#notificationlist").append(clone)
            }
        })
    })
}
function toggleFormEdit(e) {
    const formEdit = e.currentTarget.parentNode.parentNode.parentNode
        .parentNode.parentNode.parentNode.querySelector(".editPostForm");
    const content = e.currentTarget.parentNode.parentNode.parentNode
        .parentNode.parentNode.parentNode.querySelector(".statuscontent");
    content.style.display = "none";
    formEdit.style.display = 'block';
}
function removeNotOwned(){
    var postsdropdown = document.getElementsByClassName("modifyContent")
    for (var i = 0; i < postsdropdown.length; i++) {
        if (postsdropdown[i].name !== document.getElementById('userid').innerHTML.trim()) {
            postsdropdown[i].style.display = "none";
        }
    }
}
function deletePost(e){
    const postId = e.currentTarget.name;
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
    console.log("Comment")
    e.preventDefault();
    const btn = e.currentTarget;
    const commentContentSection = e.currentTarget.parentNode.querySelector(".commentContentInput");
    if (commentContentSection.value!==""){
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
                    /* done with socket io
                    var clone = document.querySelector("#cmtTemplate").content.cloneNode(true);

                    clone.querySelector(".avatar").src = document.getElementById("avt").src;
                    clone.querySelector(".display-name").innerHTML = document.getElementById('username').innerHTML.trim();
                    clone.querySelector(".profilelink").href = "/users/userid/" + document.querySelector("#userid").innerHTML;
                    clone.querySelector(".commentcontent").innerHTML = commentContentSection.value;
                    clone.querySelector(".deleteCmtBtn").addEventListener('click', e => deleteComment(e))
                    clone.querySelector(".deleteCmtBtn").name = data.commentid;
                    btn.parentNode.parentNode.querySelector('.comment-container').append(clone)
                    
                    */
                    commentContentSection.value = ""
                    socket.emit('comment', data.comment);
                } else {
                    alert(data.err)
                }
            });
        })
    }
}
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
function showComments(e) {
    const btn = e.currentTarget;
    btn.parentNode.parentNode.querySelector('.comment-container').style.display = "block";
    btn.style.display = "none";
    e.currentTarget.parentNode.querySelector(".hideCommentsBtn").style.display = "block";
    fetch("/comments/list/postid/" + btn.name).then(response => {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code:' + response.status)
            return;
        }
        response.json().then(data => {
            removeAllChildNodes(btn.parentNode.parentNode.querySelector('.comment-container'));
            for (let i = 0; i < data.length; i++) {
                var clone = document.querySelector("#cmtTemplate").content.cloneNode(true);
                
                clone.querySelector(".avatar").src = data[i].ownerAvatar;
                clone.querySelector(".display-name").innerHTML = data[i].ownerName;
                clone.querySelector(".profilelink").href = "/users/userid/" + data[i].ownerId;
                clone.querySelector(".commentcontent").innerHTML = data[i].content;
                clone.querySelector(".deleteCmtBtn").name = data[i]._id;
                clone.querySelector(".modifyContent").name = data[i].ownerId;
                btn.parentNode.parentNode.querySelector('.comment-container').append(clone)
            }
            const deleteCommentBtns = [].slice.call(document.getElementsByClassName('deleteCmtBtn'))
            deleteCommentBtns.forEach(button => {
                button.addEventListener('click', e => deleteComment(e))
            })
            removeNotOwned()
        })
    })
}
function hideComments(e){
    const btn = e.currentTarget;
    btn.style.display = "none";
    e.currentTarget.parentNode.querySelector(".showCommentsBtn").style.display = "block";
    //removeAllChildNodes(btn.parentNode.parentNode.querySelector('.comment-container'));
    btn.parentNode.parentNode.querySelector('.comment-container').style.display = "none";
}
function addOnePost(postinfo, type, prepend){
    
    var clone = document.querySelector("#postTemplate").content.cloneNode(true);
    clone.querySelector(".post").id = postinfo._id
    var nameEl = clone.querySelector(".display-name");
    nameEl.innerHTML = postinfo.ownerName;
    var profileLinkEl = clone.querySelector(".profilelink")
    profileLinkEl.href = "/users/userid/" + postinfo.ownerId;
    var statusEl = clone.querySelector(".statuscontent");
    statusEl.innerHTML = postinfo.content;
    var editEl = clone.querySelector(".editcontent");
    editEl.value = postinfo.content;
    editEl.name = postinfo._id;
    var commentEl = clone.querySelector(".commentContentInput");
    commentEl.name = postinfo._id;
    var editPostForm = clone.querySelector(".editPostForm")
    editPostForm.style.display = "none";
    var avatarEl = clone.querySelector(".avatar");
    avatarEl.src = postinfo.ownerAvatar;
    var videoLinkEl = clone.querySelector(".video-link");
    videoLinkEl.href = postinfo.videoSrc;
    videoLinkEl.innerHTML = postinfo.videoSrc;
    var createdAtEl = clone.querySelector(".created-at");
    createdAtEl.innerHTML = "<i class='fa fa-clock-o'></i> " + moment(postinfo.created_at).fromNow();
    createdAtEl.title = moment(postinfo.created_at).format('MMMM Do YYYY, h:mm:ss a');
    var showCommentsBtn = clone.querySelector('.showCommentsBtn')
    showCommentsBtn.name = postinfo._id;
    clone.querySelector(".modifyContent").name = postinfo.ownerId;
    clone.querySelector(".deletePostBtn").name = postinfo._id;
    clone.querySelector(".editPostBtn").addEventListener('click', e => toggleFormEdit(e))
    clone.querySelector(".savePostBtn").addEventListener('click', e => editPost(e))
    clone.querySelector(".deletePostBtn").addEventListener('click', e => deletePost(e))
    clone.querySelector(".commentBtn").addEventListener('click', e => postComment(e))
    clone.querySelector(".showCommentsBtn").addEventListener('click', e => showComments(e))
    clone.querySelector(".hideCommentsBtn").addEventListener('click', e => hideComments(e))
    var postImg = clone.querySelector(".postImg");
    var videoEl = clone.querySelector(".video");
    if (postinfo.imageSrc !== "") {
        var imageSrc = postinfo.imageSrc;
        imageSrc = imageSrc.replace("/public", "");
        postImg.src = prepend + imageSrc;
        videoEl.style.display = "none";
        clone.querySelector(".video-container").style.display = "none";
    } else {
        postImg.style.display = "none";
        if (postinfo.videoSrc !== "") {
            var videoSrc = postinfo.videoSrc;
            videoSrc = videoSrc.replace("watch?v=", "embed/");
            var videoSrc1 = ""
            for (var j = 0; j < videoSrc.length; j++) {
                if (videoSrc[j] === "&") {
                    break;
                }
                videoSrc1 += videoSrc[j]
            }
            videoEl.src = videoSrc1;
            videoEl.width = "100%";
        } else {
            videoEl.style.display = "none";
            clone.querySelector(".video-container").style.display = "none";
            statusEl.style.fontSize = "200%";
        }
    }
    if (postinfo.content === "") statusEl.style.display = "none";
    if (type==="old"){
        document.getElementById('newsfeed').append(clone);
    } else if (type==="new"){
        document.getElementById('newsfeed').prepend(clone);
    }
}

function getPosts(route,prepend) {
    fetch(route).then(response => {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: + response.status')
            return;
        }
        response.json().then(data => {
            for (let i = 0; i < data.length; i++) {
                addOnePost(data[i], "old", prepend)
                followingPosts.push(data[i]._id)
            }
            $("img").on("error", function () {
                $(this).attr("src", "/images/imagenotfound.png");
            });
            var buttons = document.getElementsByClassName('showCommentsBtn');
            for (var i = 0; i < buttons.length; i++)
                buttons[i].click();
            removeNotOwned();
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
                addOneNotification(data[i], "old")
            }
        })
    })
}
function addOneNotification(noti, type){
    var clone = document.querySelector("#notiTemplate").content.cloneNode(true);
    clone.querySelector(".falcutyname").innerHTML = noti.categoryName;
    clone.querySelector(".contentsummary").innerHTML = noti.content.slice(0, 70);
    clone.querySelector(".created-at").innerHTML = moment(noti.created_at).format("Do MMM YYYY");
    clone.querySelector(".notiTitle").href = "/notifications/details/" + noti._id;
    clone.querySelector(".notiTitle").innerHTML = noti.title;
    
    if (type==="old"){
        document.getElementById("notiList").append(clone);
        $(".notiCard:last-child").css("display", "block");
    } else if (type==="new"){
        clone.querySelector(".notiCard").style.backgroundColor = "#4CAF50";
        clone.querySelector(".notiCard").style.color = "white";
        document.getElementById("notiList").prepend(clone);
        const $card = $(".notiCard:first-child")
        $card.slideDown(1000);
        window.setTimeout(function(){
            $card.delay(1000).css("background-color", "white");
            $card.delay(1000).css("color", "black");
        }, 2500)
        //$(".notiCard:first-child");
    }
}
function postArticle(e){
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
                socket.emit('post', data.post);
                followingPosts.push(data.postid);
                document.getElementById('postcontent').value === ""
                /*var clone = document.querySelector("#postTemplate").content.cloneNode(true);
                clone.querySelector(".post").id = data.postid
                var nameEl = clone.querySelector(".display-name");
                nameEl.innerHTML = document.getElementById('username').innerHTML.trim();
                var statusEl = clone.querySelector(".statuscontent");
                statusEl.innerHTML = document.getElementById('postcontent').value;
                var avatarEl = clone.querySelector(".avatar");
                avatarEl.src = document.getElementById("avt").src;
                var editPostForm = clone.querySelector(".editPostForm")
                var profileLinkEl = clone.querySelector(".profilelink")
                profileLinkEl.href = "/users/userid/" + document.getElementById('userid').innerHTML.trim();
                editPostForm.style.display = "none";
                var commentEl = clone.querySelector(".commentContentInput");
                commentEl.name = data.postid;
                
                clone.querySelector(".editPostBtn").addEventListener('click', e => toggleFormEdit(e))
                clone.querySelector(".savePostBtn").addEventListener('click', e => editPost(e))
                clone.querySelector(".deletePostBtn").addEventListener('click', e => deletePost(e))
                clone.querySelector(".deletePostBtn").name = data.postid;
                clone.querySelector(".commentBtn").addEventListener('click', e => postComment(e))

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
                        var videoSrc1 = ""
                        for (var j = 0; j < videoSrc.length; j++) {
                            if (videoSrc[j] === "&") {
                                break;
                            }
                            videoSrc1 += videoSrc[j]
                        }
                        videoEl.src = videoSrc1;
                    } else {
                        videoEl.style.display = "none";
                        clone.querySelector(".video-container").style.display = "none";
                        statusEl.style.fontSize = "200%";
                    }
                    
                }
                document.getElementById('newsfeed').prepend(clone);

                document.getElementById('postcontent').value = '';*/
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
                document.querySelector(".createAccForm").reset()
                document.querySelector(".postNotiContainer").style.display = 'block';
                $(".postNotiContainer").delay(4000).fadeOut(300);
            } else {
                alert(data.err)
            }
        });

    })
    
}
function postNoti(e){
    var notiTextArea = document.querySelector("#noticontent")
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
                document.querySelector(".postNotiForm").reset()
                document.querySelector(".postNotiContainer").style.display = 'block';
                $(".postNotiContainer").delay(4000).fadeOut(300);
                socket.emit('notification', data.noti);
            } else {
                alert(data.err)
            }
        });

    })
}


