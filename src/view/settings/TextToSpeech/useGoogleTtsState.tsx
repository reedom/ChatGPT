import React, {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';
import { open } from '@tauri-apps/api/dialog';
import { readTextFile } from '@tauri-apps/api/fs';
import { invoke } from '@tauri-apps/api';
import { Form, Input } from 'antd';

type Props = PropsWithChildren;

interface State {
  enabledGoogleTts: boolean;
  hasNewCredential: boolean;
  voices?: GoogleTtsVoice[];
  selected?: GoogleTtsVoice;
  loadCredential: () => void;
}

export enum Gender {
  male = 1,
  female = 2,
}

export interface GoogleTtsVoice {
  name: string;
  gender: Gender;
  language_codes: string;
}

export const Context = createContext<State>({} as State);

export const GoogleTtsStateProvider: FC<Props> = ({ children }) => {
  const form = useFormInstance();
  const [credential, setCredential] = useState(form.getFieldValue('google_cred'));
  const [voices, setVoices] = useState<GoogleTtsVoice[]>();
  const [selected, setSelected] = useState<GoogleTtsVoice | undefined>();
  const [enabledGoogleTts] = useState<boolean>(!!credential);
  const [hasNewCredential, setHasNewCredential] = useState(false);

  useEffect(() => {
    if (!credential) return;

    invoke<any>('google_text_to_speech_voices')
      .then((voices) => {
        if (voices) {
          setVoices(voices);
          setSelected(voices[0]);
        } else {
          setSelected(undefined);
        }
      })
      .catch();
  }, [credential]);

  const loadCredential = async () => {
    const selected = await open({
      defaultPath: '$HOME',
      filters: [
        {
          name: 'Credential',
          extensions: ['json'],
        },
      ],
    });

    if (typeof selected !== 'string') {
      return;
    }

    await loadNewCredential(selected);
  };

  const loadNewCredential = async (path: string) => {
    try {
      const text = await readTextFile(path);
      const valid = await invoke<boolean>('google_validate_credential', { text });
      if (valid) {
        setHasNewCredential(true);
        form.setFieldValue('google_cred', text);
      }
    } catch (e) {}
  };

  return (
    <Context.Provider
      value={{
        enabledGoogleTts,
        hasNewCredential,
        voices,
        selected,
        loadCredential,
      }}
    >
      <>
        {children}
        <Form.Item hidden name="google_cred">
          <Input value={credential} />
        </Form.Item>
      </>
    </Context.Provider>
  );
};

export const useGoogleTtsState = () => useContext(Context);
