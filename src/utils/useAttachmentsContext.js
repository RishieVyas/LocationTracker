import React, { createContext, useState, useContext, useMemo } from 'react';
import { fetchApi } from './ApiUtils';

const AttachmentsContext = createContext();

export const useAttachments = () => useContext(AttachmentsContext);

export const AttachmentsProvider = ({ children }) => {
    const [attachments, setAttachments] = useState([]);
    const [loadingAttachments, setLoadingAttachments] = useState(false);
    const [errorAttachments, setErrorAttachments] = useState(null);

    const createAttachment = async (deviceTraceId, file) => {
        const formData = new FormData();
        formData.append('deviceTraceId', deviceTraceId);
        formData.append('file', file);

        try {
            setLoadingAttachments(true);
            const newAttachment = await fetchApi('/attachments', 'POST', formData, {
                'Content-Type': 'multipart/form-data'
            });
            setAttachments((prev) => [...prev, newAttachment]);
        } catch (err) {
            setErrorAttachments(err.message);
        } finally {
            setLoadingAttachments(false);
        }
    };

    const deleteAttachment = async (id) => {
        try {
            setLoadingAttachments(true);
            await fetchApi(`/attachments/${id}`, 'DELETE');
            setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
        } catch (err) {
            setErrorAttachments(err.message);
        } finally {
            setLoadingAttachments(false);
        }
    };

    const getAttachmentById = async (id) => {
        try {
            setLoadingAttachments(true);
            const attachment = await fetchApi(`/attachments/${id}`, 'GET');
            return attachment;
        } catch (err) {
            setErrorAttachments(err.message);
        } finally {
            setLoadingAttachments(false);
        }
    };

    const getAttachments = async (include, deviceTraceId) => {
        try {
            setLoadingAttachments(true);
            const queryParams = new URLSearchParams();
            if (include) queryParams.append('include', include);
            if (deviceTraceId) queryParams.append('deviceTraceId', deviceTraceId);

            const attachmentsList = await fetchApi(`/attachments?${queryParams.toString()}`, 'GET');
            setAttachments(attachmentsList);
        } catch (err) {
            setErrorAttachments(err.message);
        } finally {
            setLoadingAttachments(false);
        }
    };

    const value = {
        attachments,
        loadingAttachments,
        errorAttachments,
        createAttachment,
        deleteAttachment,
        getAttachmentById,
        getAttachments,
    }

    return <AttachmentsContext.Provider value={value}>{children}</AttachmentsContext.Provider>;
};
