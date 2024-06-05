import React, { createContext, useState, useContext } from 'react';
import { fetchApi } from './ApiUtils'

const CommentContext = createContext();

export const useComments = () => useContext(CommentContext);

export const CommentsProvider = ({ children }) => {

    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [errorComments, setErrorComments] = useState(null);
    const [deleteCommentRes, setDeleteCommentRes] = useState(false);

    const createComments = async (payload) => {
        console.log("create comment payload", payload);
        try {
            return await fetchApi('/comments', 'POST', payload);
            
        } catch (err) {
            setErrorComments(err.message);
        }
    };


    const value = {
        createComments
    };

    return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;

}