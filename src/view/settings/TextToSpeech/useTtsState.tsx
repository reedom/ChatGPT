import React, {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';
import { Form, Input } from 'antd';

type Props = PropsWithChildren;

export enum SpeechService {
  system = 'system',
  google = 'google',
}

interface State {
  speechService: SpeechService;
  setSpeechService: (newValue: SpeechService) => void;
}

export const Context = createContext<State>({} as State);

export const TtsStateProvider: FC<Props> = ({ children }) => {
  const form = useFormInstance();
  const [speechService, setSpeechService] = useState(form.getFieldValue('speech_service'));

  useEffect(() => form.setFieldValue('speech_service', speechService), [speechService]);

  return (
    <Context.Provider
      value={{
        speechService,
        setSpeechService,
      }}
    >
      <>
        {children}
        <Form.Item hidden name="speech_service">
          <Input value={speechService} />
        </Form.Item>
      </>
    </Context.Provider>
  );
};

export const useTtsState = () => useContext(Context);
