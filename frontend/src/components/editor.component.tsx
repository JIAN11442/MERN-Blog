import {
  BlockNoteSchema,
  defaultBlockSpecs,
  filterSuggestionItems,
} from "@blocknote/core";
import {
  BlockNoteView,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";

import { Alert, insertAlert } from "../tools/alert/alert.tool";
import { CodeBlock, insertCodeBlock } from "../tools/code/code.tool";

import "@blocknote/react/style.css";
import "@mantine/core/styles.css";
import "@blocknote/core/fonts/inter.css";

interface EditorProps {
  className?: string;
}

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    alert: Alert,
    codeblock: CodeBlock,
  },
});

const Editor: React.FC<EditorProps> = ({ className }) => {
  const blocknoteEditor = useCreateBlockNote({ schema });

  return (
    <BlockNoteView
      editor={blocknoteEditor}
      slashMenu={false}
      className={className}
      onSelectionChange={() => {
        console.log(blocknoteEditor.document);
      }}
    >
      <SuggestionMenuController
        triggerCharacter={"/"}
        getItems={async (query) =>
          // Gets all default slash menu items and `insertAlert` item.
          filterSuggestionItems(
            [
              ...getDefaultReactSlashMenuItems(blocknoteEditor),
              insertAlert(blocknoteEditor),
              insertCodeBlock(blocknoteEditor),
            ],
            query
          )
        }
      />
    </BlockNoteView>
  );
};

export default Editor;
