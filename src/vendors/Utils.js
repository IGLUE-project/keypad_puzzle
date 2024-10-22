import {GLOBAL_CONFIG} from '../config/config.js';

export function isPDFSupported(){
  var pdfReaderSupport = false;
  if((typeof navigator.mimeTypes == "object")&&("application/pdf" in navigator.mimeTypes)){
    pdfReaderSupport = true;
  }
  return pdfReaderSupport;
};

export function isImage(url){
  if(typeof url === "string"){
  	//Remove options
	url = url.split('?')[0];
	let extension = (url.split('.').pop().split('&')[0]).toLowerCase();
	if(["jpg","jpeg","png","gif","bmp","svg"].indexOf(extension)!="-1"){
		return true;
	}
  }
  return false;
};