"use client";
import 'jquery'
import ReactSummernoteLite from './summernote/ReactSummernote';
import 'react';
import './Summernote.css';
import React, { useMemo } from 'react';
import { RespVercelStorageBody } from './VercelStorage.dto';
import { SummernoteCallbackInitProps } from './summernote/index';


const EditorComponent = ({
  value,
  onChange
}:{
  value: string,
  onChange: (content: string) => void
}) => {
  let $note: any = null;
  let summernoteContent = value;
  /**
   * # 이미지를 vercel storage 에 업로드한다.
   * @param file
   * @returns
   */
  async function uploadImageToStorage(
    file: File
  ): Promise<RespVercelStorageBody> {
    try {
      const response = await fetch(`/api/static/upload?filename=${file.name}`, {
        method: "POST",
        body: file,
      });
      const data: RespVercelStorageBody = await response.json();
      return data;
    } catch (error) {
      throw new Error("uploadImageToStorage error");
    }
  }

  const onSummernoteInit = ({ note }: SummernoteCallbackInitProps) => {
    if($note == null && note != null && note.summernote != null && summernoteContent != null && summernoteContent !== '') {
      note.summernote('pasteHTML', summernoteContent)
    }
    if($note == null) {
      $note = note; 
    }
  }
  const onSummernoteImageUpload = (files: any) => {
    // upload
    uploadImageToStorage(files[0]).then((src) => {
      $note?.summernote('insertImage', src.url);
    });
  }
  const onSummernoteChange = (content: string) => {
    // onChange(content);
    summernoteContent = content
    onChange(summernoteContent);
  }
  
  const options = useMemo(() => {
    return {
      height: 400,
      tabsize: 2,
      toolbar: [
        ['style', ['bold', 'italic', 'strikethrough', 'clear']],
        ['para', ['style', 'fontsize', 'ul', 'ol', 'paragraph']],
        ['fontsize', ['forecolor', 'backcolor']],
        ['insert', ['picture', 'link', 'video', 'table', 'hr']],
        ['misc', ['undo', 'redo']],
      ],
      popover: {
        table: [
          ['merge', ['jMerge']],
          ['style', ['jBackcolor', 'jBorderColor', 'jAlign', 'jAddDeleteRowCol']],
          ['info', ['jTableInfo']],
          ['delete', ['jWidthHeightReset', 'deleteTable']]
        ],
        image: [
          ['custom', ['examplePlugin']],
          ['imagesize', ['resizeFull', 'resizeHalf', 'resizeQuarter', 'resizeNone']],
          ['float', ['floatLeft', 'floatRight', 'floatNone']],
          ['remove', ['removeMedia']],
          ['custom', ['imageAttributes']],
        ]
      },
      callbacks: {
        onInit: onSummernoteInit,
        onImageUpload: onSummernoteImageUpload,
        onChange: onSummernoteChange,
        onBlur: (event: string) => {
          console.log('onBlur', event);
          onChange(summernoteContent);
        }
      },
      fontSizes: ['8', '9', '10', '11', '12', '14', '18', '24', '36', '48', '64', '72'],
    }
  }, []);

  const SummernodeMemo = useMemo(() => {
    return <ReactSummernoteLite 
      id="sample" 
      opt={options} />
  }, []);
  return (
    <div className="upbox-summernote">
      {/* <ReactSummernoteLite 
        id="sample" 
        opt={options} /> */}
        {SummernodeMemo}
    </div>)
}

export default EditorComponent;