import { Button, Form, Select, Tag } from 'antd';
import { Gender, useGoogleTtsState } from './useGoogleTtsState';
import { SpeechService, useTtsState } from '@view/settings/TextToSpeech/useTtsState';

export default function GoogleTtsVoices() {
  const { setSpeechService } = useTtsState();
  const { voices } = useGoogleTtsState();

  return (
    <Form.Item name="google_speech_lang">
      <Select
        style={{ width: 300 }}
        disabled={!voices}
        onSelect={() => setSpeechService(SpeechService.google)}
      >
        {!voices
          ? null
          : voices.map((voice) => {
              return (
                <Select.Option key={voice.name} value={voice.name}>
                  {voice.name} {': '}
                  <Tag>{voice.language_codes[0]}</Tag>
                  <Tag>{Gender[voice.gender]}</Tag>
                </Select.Option>
              );
            })}
      </Select>
    </Form.Item>
  );
}

export function LoadCredentialButton() {
  const { enabledGoogleTts, loadCredential } = useGoogleTtsState();

  return (
    <Button
      style={{ marginBottom: 10 }}
      className="chat-add-btn"
      type="primary"
      onClick={loadCredential}
    >
      {enabledGoogleTts ? 'Set Credential' : 'Load Credential JSON'}
    </Button>
  );
}
