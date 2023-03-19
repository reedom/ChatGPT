import React, { createContext, FC, PropsWithChildren, useContext, useState } from 'react';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';

type Props = PropsWithChildren;

interface State {
  voiceURI: string;
  setVoiceURI: (voiceURI: string) => void;
}

export const Context = createContext<State>({} as State);

export const BrowserBundledProvider: FC<Props> = ({ children }) => {
  const form = useFormInstance();
  const [voiceURI, setVoiceURI] = useState<string>(form.getFieldValue('speech_lang'));

  return (
    <Context.Provider
      value={{
        voiceURI,
        setVoiceURI,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useBrowserBundledState = () => useContext(Context);
