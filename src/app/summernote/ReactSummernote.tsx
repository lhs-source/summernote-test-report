import React from "react";
import { createRoot } from "react-dom/client";
import "./dist/summernote-lite";
import "./dist/summernote-lite.css";
import Summernote, {
  SummernotePlugin,
  createSummernotePlugin,
  setSummernoteLang,
  setSummernoteShortcut,
} from "./Summernote";
import {
  SummernoteContext,
  SummernoteCustomButtonProps,
  SummernoteProps,
} from "./index";
export {
  SummernotePlugin,
  createSummernotePlugin,
  setSummernoteLang,
  setSummernoteShortcut,
};

interface ButtonProps {
  container?: string;
  tooltip?: string;
  contents?: string;
  click?: () => void;
}

interface Attribute {
  context?: SummernoteContext;
}
export function createSummernoteButton(opt: SummernoteCustomButtonProps): any {
  return (context: SummernoteContext) => {
    let buttonProps: ButtonProps = {
      container: opt.container || "body",
      tooltip: opt.tooltip || "sample",
    };

    if (opt.title && !opt.element) {
      buttonProps.contents = opt.title;
      buttonProps.click = () => {
        if (opt?.onClick) {
          opt.onClick(context);
        }
      };
      return context.ui.button(buttonProps).render();
    } else {
      const button = context.ui.button(buttonProps);
      const el = button.render(); // return button as jquery object

      if (opt?.element) {
        const props = { context, ...opt.props };
        createRoot(el[0]).render(
          React.createElement<Attribute>(opt.element, props)
        );
      }

      return el;
    }
  };
}

function ReactSummernoteLite({ children, ...props }: SummernoteProps) {
  return <Summernote {...props}>{children}</Summernote>;
}

export default ReactSummernoteLite;
