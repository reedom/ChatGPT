import { useState } from 'react';
import { Form, Select, Tag } from 'antd';
import useInit from '@/hooks/useInit';
import { SpeechService, useTtsState } from '@view/settings/TextToSpeech/useTtsState';

export default function BrowserBundledVoices() {
  const { setSpeechService } = useTtsState();
  const [vlist, setVoices] = useState<any[]>([]);
  useInit(async () => {
    speechSynthesis.addEventListener('voiceschanged', () => {
      const voices = speechSynthesis.getVoices();
      setVoices(voices);
    });
    setVoices(speechSynthesis.getVoices());
  });

  return (
    <Form.Item name="speech_lang">
      <Select style={{ width: 300 }} onSelect={() => setSpeechService(SpeechService.system)}>
        {vlist.map((voice: any) => {
          return (
            <Select.Option key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name} {': '}
              <Tag>{voice.lang}</Tag>
            </Select.Option>
          );
        })}
      </Select>
    </Form.Item>
  );
}
