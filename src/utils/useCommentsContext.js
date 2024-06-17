import React, { createContext, useState, useContext } from 'react';
import { fetchApi } from './ApiUtils'
import { Alert } from 'react-native';

const CommentContext = createContext();

export const useComments = () => useContext(CommentContext);

export const CommentsProvider = ({ children }) => {

    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [errorComments, setErrorComments] = useState(null);
    const [deleteCommentRes, setDeleteCommentRes] = useState(false);

    const createComments = async (payload) => {
        console.log("create comment payload", payload);
        setLoadingComments(true)
        try {
            const createres = await fetchApi('/comments', 'POST', payload);

            if(createres){
               Alert.alert('Success', "Comment uploaded sccessfully");
            }

            console.log("comment response --------------- ", createres);
            return createres;
        } catch (err) {
            Alert.alert('Error', 'Something went wrong')
            setErrorComments(err.message);
        } finally {
            setLoadingComments(false)
        }
    };


    const value = {
        createComments
    };

    return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;

}