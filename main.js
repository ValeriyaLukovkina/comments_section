let comments = [];

const savedComments = (comments) => {
    localStorage.setItem('comment', JSON.stringify(comments));
}

const likedComments = (wrp, img, commentId) => {
    if (wrp.classList.contains('comments-like_active')) {
        wrp.classList.remove('comments-like_active');
        img.src = '././assests/svg/heart.svg';
        comments.filter(el => {
            return el.commentId == commentId;
        })[0].liked = false;
    } else {
        wrp.classList.add('comments-like_active');
        img.src = '././assests/svg/like.svg';
        comments.filter(el => {
            return el.commentId == commentId;
        })[0].liked = true;
    }
    localStorage.setItem('comment', JSON.stringify(comments));
}

const deleteComment = (commentId, event) => {
    const commentsWrp = document.querySelector('.comments');
    const currentComment = event.target.closest('.comments-block');
    commentsWrp.removeChild(currentComment);
    comments = comments.filter(el => {
        return el.commentId != commentId;
    })
    localStorage.setItem('comment', JSON.stringify(comments));
}

const addZero = (num) => {
    if (num <= 9) {
        return '0' + num;
    }
    return num;
}

const formatDate = (dateUTC) => {
    const dateNow = new Date()
    const difDate = Math.floor((dateNow - dateUTC) / (60 * 60 * 24 * 1000));
    const formTime = `${addZero(dateNow.getHours())}:${addZero(dateNow.getMinutes())}`
    if (difDate == 0) {
        return `сегодня, ${formTime}`
    } else if (difDate == 1) {
        return `вчера, ${formTime}`
    } else {
        return `${dateUTC.toLocaleDateString()}, ${formTime}`
    }
}

const valedateDate = (commentDate) => {
    const dateUTC = new Date(commentDate);
    if (commentDate) {
        return formatDate(dateUTC)
    } else {
        return `сегодня, ${addZero(new Date().getHours())}:${addZero(new Date().getMinutes())}`
    }
}

const createElement = (wrp, nameTag, classTitle, txtTag, extraObj) => {
    const tag = document.createElement(nameTag);
    tag.className = classTitle;
    tag.innerHTML = txtTag;
    if (extraObj && extraObj.src) {
        tag.src = extraObj.src
    }
    wrp.append(tag);
    return tag;
}

const createComment = (comment) => {
    let formDate = valedateDate(comment.commentDate);
    const commentBlock = document.querySelector('.comments');
    const wrpTag = document.createElement('div');
    wrpTag.classList.add('comments-block');

    createElement(wrpTag, 'p', 'comments-block_username', comment.userName, null);
    createElement(wrpTag, 'p', 'comments-block_txt', comment.commentTxt, null);
    createElement(wrpTag, 'p', 'comments-block_date', formDate, null);

    let commentLike;
    let commentLikeImg;
    if (comment.liked) {
        commentLike = createElement(wrpTag, 'div', 'comments-like comments-like_active', null, null);
        commentLikeImg = createElement(commentLike, 'img', 'comments-like_img', null, { src: '././assests/svg/like.svg' });
    } else {
        commentLike = createElement(wrpTag, 'div', 'comments-like', null, null);
        commentLikeImg = createElement(commentLike, 'img', 'comments-like_img', null, { src: '././assests/svg/heart.svg' });
    }

    commentLike.onclick = () => likedComments(commentLike, commentLikeImg, comment.commentId)
    const commentTrash = createElement(wrpTag, 'div', 'comments-trash', null, null);
    createElement(commentTrash, 'img', 'comments-trash_img', null, { src: './assests/svg/trash.svg' });
    commentTrash.onclick = () => deleteComment(comment.commentId, event);

    commentBlock.prepend(wrpTag)
}

const valedateUserName = (userName) => {
    return /^[a-zA-ZА-Яа-я ]+$/.test(userName);
}

const valedateCommentTxt = (commentTxt, maxLength) => {
    if (commentTxt.length > maxLength) {
        return false
    }
    return true
}

const addComment = () => {
    event.preventDefault();
    const maxLengthComments = 1024;
    const userName = document.querySelector('#username');
    const commentDate = document.querySelector('#date');
    const commentTxt = document.querySelector('.add-comments_block_txt');

    const resultUserName = valedateUserName(userName.value);
    const resultTxt = valedateCommentTxt(commentTxt.value, maxLengthComments);

    if (!resultUserName || !resultTxt || !userName.value || !commentTxt.value) {
        if (!resultUserName || !userName.value) {
            const commentsNameError = document.querySelector('.add-comments_info_name_error');
            const commentsNameErrorBody = document.querySelector('.add-comments_info_name_error_txt');
            const commentsNameInputError = document.querySelector('.add-comments_info_name_input');
            commentsNameError.classList.add('add-comments_info_name_error_show');
            commentsNameInputError.classList.add('add-comments_info_name_input_error');

            if (!userName.value) {
                commentsNameErrorBody.innerHTML = 'Обязательное поле';
            } else if (!resultUserName) {
                commentsNameErrorBody.innerHTML = 'Некорректное имя пользователя. Имя может содержать только буквы';
            }
        }
        if (!resultTxt || !commentTxt.value) {
            const commentsBlockTxt = document.querySelector('.add-comments_block_txt');
            const commentsBlockError = document.querySelector('.add-comments_block_error');
            const commentsBlockErrorBody = document.querySelector('.add-comments_block_error_txt');
            commentsBlockError.classList.add('add-comments_block_error_show');
            commentsBlockTxt.classList.add('add-comments_block_txt_error');

            if (!commentTxt.value) {
                commentsBlockErrorBody.innerHTML = 'Обязательное поле';
            } else if (!resultTxt) {
                commentsBlockErrorBody.innerHTML = `Максимальная длина комментария ${maxLengthComments}`;
            }
        }
        throw 'Некорректные данные';
    }

    const id = comments && comments.length > 0 ? +comments[comments.length - 1].commentId + 1 : 1

    const comment = {
        userName: userName.value,
        commentDate: commentDate.value,
        commentTxt: commentTxt.value,
        liked: false,
        commentId: id
    }

    comments.push(comment);

    userName.value = '';
    commentDate.value = '';
    commentTxt.value = '';

    savedComments(comments);
    createComment(comment);
}

document.querySelector('.add-comments').onsubmit = addComment;

const initialized = () => {
    const localStorageComments = JSON.parse(localStorage.getItem('comment'));
    if (localStorageComments) {
        comments = localStorageComments;
        if (comments && comments.length != 0) {
            for (comment of comments) {
                createComment(comment)
            }
        }
    }
}

document.querySelector('#username').onkeydown = (event) => {
    if (!event.key.match(/[A-Za-zА-Яа-я ]/)) {
        event.preventDefault();
    }
}

const removeError = (input, blockError, contains, txtError) => {
    const inputElem = document.querySelector(input);
    const blockWithError = document.querySelector(blockError);
    if (blockWithError.classList.contains(contains)) {
        blockWithError.classList.remove(contains);
        inputElem.classList.remove(txtError);
    }
}

document.querySelector('.add-comments_block_txt').oninput = () => {
    removeError('.add-comments_block_txt', '.add-comments_block_error',
        'add-comments_block_error_show', 'add-comments_block_txt_error');
}

document.querySelector('.add-comments_info_name_input').oninput = () => {
    removeError('.add-comments_info_name_input', '.add-comments_info_name_error',
        'add-comments_info_name_error_show', 'add-comments_info_name_input_error');
}

initialized()