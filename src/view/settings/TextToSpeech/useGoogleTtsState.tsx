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
  selectedName?: string;
  setSelectedName: (name: string) => void;
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
  const [credential, setCredential] = useState<string>(form.getFieldValue('google_cred'));
  const [selectedName, setSelectedName] = useState<string>(
    form.getFieldValue('google_speech_name'),
  );
  const [voices, setVoices] = useState<GoogleTtsVoice[]>();
  const [selectedVoice, setSelectedVoice] = useState<GoogleTtsVoice | undefined>();
  const [enabledGoogleTts] = useState<boolean>(!!credential);
  const [hasNewCredential, setHasNewCredential] = useState(false);

  useEffect(() => {
    if (!credential) return;

    invoke<any>('google_text_to_speech_voices').then(setVoices);
  }, [credential]);

  useEffect(() => {
    if (!voices?.length) return;

    const voice = voices.find((v) => v.name === selectedName);
    setSelectedVoice(voice);
    if (voice && selectedName) {
      form.setFieldValue('google_speech_name', voice.name);
      form.setFieldValue('google_speech_gender', voice.gender);
    }
  }, [voices, selectedName]);

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
        selectedName,
        loadCredential,
        setSelectedName: (name) => {
          setSelectedName(name);
        },
      }}
    >
      <>
        {children}
        <Form.Item hidden name="google_cred">
          <Input value={form.getFieldValue('google_cred')} />
        </Form.Item>
        <Form.Item hidden name="google_speech_name">
          <Input value={form.getFieldValue('google_speech_name')} />
        </Form.Item>
        <Form.Item hidden name="google_speech_gender">
          <Input value={form.getFieldValue('google_speech_gender')} />
        </Form.Item>
      </>
    </Context.Provider>
  );
};

export const useGoogleTtsState = () => useContext(Context);
