import React, { createContext, useState, useContext, useMemo } from 'react';
import { fetchApi } from './ApiUtils';
import { Alert, Platform } from 'react-native';

const AttachmentsContext = createContext();

export const useAttachments = () => useContext(AttachmentsContext);

const token = "g30rd4n15c00l!";
const API_BASE_URL = "https://tracker.ritis.org/api/v1";

export const AttachmentsProvider = ({ children }) => {
    const [attachments, setAttachments] = useState([]);
    const [loadingAttachments, setLoadingAttachments] = useState(false);
    const [errorAttachments, setErrorAttachments] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    
    const fetchAttachmentAPI = async (endpoint, method, body) => {

        const headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
        };
    
        const config = {
            method: method,
            headers: headers,
            body: method == "GET" && method == "DELETE" ? null : body,
        };

        try {
            console.log("API URL: ", `${API_BASE_URL}${endpoint}`);
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
            const result = await response.json();
            console.log("result of the API", result);
            if (response.ok) {
              Alert.alert('Success', 'Media uploaded successfully');
            } else {
              Alert.alert('Error', result.message || 'Failed to upload media');
            }
          } catch (error) {
            console.error('Upload failed:', error);
            Alert.alert('Error', 'Failed to upload media');
          }
        }

    const createAttachment = async (traceId, uri) => {
        const data = new FormData;
        data.append('deviceTraceId', traceId) ;
        data.append('attachment', {
            name: mediaType === 'photo' ? 'photo.jpg' : 'video.mov',
            type: mediaType === 'photo' ? 'image/jpeg' : 'video/mov',
            uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri
        });
        try {
            setLoadingAttachments(true); 
            console.log("attachment payload", data);
            console.log("attachment object", data._parts[1]);
            const newAttachment = await fetchAttachmentAPI('/attachments', 'POST', data);
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
        setMediaType
    }

    return <AttachmentsContext.Provider value={value}>{children}</AttachmentsContext.Provider>;
};
