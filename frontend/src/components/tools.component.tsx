// importing tools

import Embed from '@editorjs/embed';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import Header from '@editorjs/header';
import Quote from '@editorjs/quote';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import Code from '@editorjs/code';

// import CodeBox from '@bomdi/codebox';

import useAwsFetch from '../fetchs/aws.fetch';

// import CodeMirror from 'editorjs-codemirror';
// import 'codemirror/mode/shell/shell';
// import 'codemirror/mode/vue/vue';
// import 'codemirror/mode/jsx/jsx';
// import 'codemirror/mode/markdown/markdown';
// import 'codemirror/mode/sass/sass';

// import 'codemirror/theme/idea.css';

export const UploadImageByURL = async (e: string) => {
  const link = new Promise((resolve, reject) => {
    try {
      resolve(e);
    } catch (error) {
      reject(error);
    }
  });

  const url = await link;
  return {
    success: 1,
    file: { url },
  };
};

export const UploadImageByFile = async (e: File) => {
  const { UploadImageToAWS } = useAwsFetch();

  return UploadImageToAWS(e).then((url) => {
    if (url) {
      return {
        success: 1,
        file: { url },
      };
    }
  });
};

const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByUrl: UploadImageByURL,
        uploadByFile: UploadImageByFile,
      },
    },
  },
  header: {
    class: Header,
    inlineToolbar: true,
    config: {
      // placeholder: 'Type Heading...',
      levels: [1, 2, 3, 4],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  code: {
    // class: CodeBox,
    // config: {
    //   useDefaultTheme: 'light',
    // },

    class: Code,
  },
  marker: Marker,
  inlineCode: InlineCode,
};

export default tools;

// CodeMirror
// code: {
//   class: CodeMirror,
//   config: {
//     languages: [
//       {
//         name: "Shell",
//         mode: "application/x-sh",
//       },
//       {
//         name: "JSX",
//         mode: "text/typescript-jsx",
//       },
//       {
//         name: "Vue",
//         mode: "text/x-vue",
//       },
//       {
//         name: "MarkDown",
//         mode: "text/x-markdown",
//       },
//       {
//         name: "SASS",
//         mode: "text/x-sass",
//       },
//     ],
//     codeMirrorConfig: {
//       tabSize: 4,
//       styleActiveLine: { nonEmpty: true },
//       styleActiveSelected: true,
//       line: false,
//       foldGutter: true,
//       autofocus: false,
//       styleSelectedText: true,
//       showCursorWhenSelecting: true,
//       dragDrop: true,
//       lint: true,
//       theme: "idea",
//       extraKeys: { Ctrl: "autocomplete" },
//       hintOptions: {
//         completeSingle: false,
//       },
//     },
//   },
// },
