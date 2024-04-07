import { defaultProps, insertOrUpdateBlock } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";

import { RiAlertFill } from "react-icons/ri";

import TiptapCodeBlock from "../../components/codeblock.component";

import { schema } from "@/src/components/editor.component";

import "./styles.css";

export const CodeBlock = createReactBlockSpec(
  {
    type: "codeblock",
    propSchema: {
      ...defaultProps,
    },
    content: "inline",
  },
  {
    render: (props) => {
      const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target;

        // Auto resize the textarea with the content
        input.style.height = "auto";
        input.style.height = `${input.scrollHeight}px`;
      };

      return (
        // <div className="relative">
        //   <TiptapCodeBlock contentRef={props.contentRef} className="w-full" />

        //   {/*Rich text field for user to type in*/}
        //   {/* <div className={"inline-content bg-red-100"} ref={props.contentRef} /> */}
        // </div>

        <textarea
          ref={props.contentRef}
          onChange={(e) => handleOnChange(e)}
          className="
            w-full
            p-2
            bg-gray-100
            rounded-md
            overflow-hidden
          "
        />
      );
    },
  }
);

export const insertCodeBlock = (editor: typeof schema.BlockNoteEditor) => ({
  title: "Code",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      type: "codeblock",
    });
  },
  group: "Other",
  icon: <RiAlertFill className="text-lg" />,
});
