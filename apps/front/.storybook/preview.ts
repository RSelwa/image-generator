import type { Preview } from '@storybook/nextjs-vite'
import { themes } from 'storybook/theming'
import '../app/globals.css'
import { ModeDecorator } from "./modeDecorator";


export const decorators = [ModeDecorator];

const preview: Preview = {
  parameters: {
    docs: {
      theme: themes.dark,
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;