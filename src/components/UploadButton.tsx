import React from 'react';
import { RequestType, endpoint } from '../controllers/imageFetch';
import CustomButton from './CustomUploadButton';
import firebase from 'firebase';
import { authToken } from '../firebase';

// Handles the picked image after the user picks it.
const imageHandler = async (imageFile: File) => {
  console.log('Handling picked file', imageFile);
  try {
    const imageUrl = await handleImageUpload(imageFile);
    await handleImageUrl(imageUrl);
  } catch (err) {
    console.error(err);
  }
};

// Uploads the image to firebase storage.
const handleImageUpload = async (imageFile: File) => {
  // Create a root reference to firebase storage.
  const storageRef = firebase.storage().ref();
  // Get current time in ms.
  const time: number = new Date().getTime();
  // Concatenate file name with time in ms to enable uploads of same image names.
  const imageName = `${time}-${imageFile.name}`;
  // Create a reference to the image file name.
  var imageRef = storageRef.child(imageName);
  // Upload the file to fire storage.
  const url = await imageRef.put(imageFile).then(async function(snapshot) {
    const imageUrl = await snapshot.ref.getDownloadURL();
    console.log(`Uploaded ${imageName}!`, 'Image is accessible at', imageUrl);
    return imageUrl as string;
  });
  return url;
};

// Adds a new document containing the uploaded image url on firestore.
const handleImageUrl = async (imageUrl: string) => {
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('load', () => {
    const responseText = xhr.responseText;
    console.log(responseText);
  });
  const token = await authToken();
  xhr.open(RequestType.POST, endpoint);
  xhr.setRequestHeader('Authorization', token);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  const body = JSON.stringify({ imageUrl: imageUrl });
  console.log('Posting', body);
  xhr.send(body);
};

interface IProps {
  hook: Function;
}

const UploadButton = ({ hook: imageUrlsHook }: IProps) => {
  return <CustomButton imageHandler={imageHandler} hook={imageUrlsHook} />;
};

export default UploadButton;
