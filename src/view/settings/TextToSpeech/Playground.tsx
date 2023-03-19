import useFormInstance from 'antd/es/form/hooks/useFormInstance';
import { SpeechService, useTtsState } from '@view/settings/TextToSpeech/useTtsState';
import { FormEvent, useState } from 'react';
import { invoke } from '@tauri-apps/api';
import { Button, Form, Input } from 'antd';
import { useBrowserBundledState } from '@view/settings/TextToSpeech/useBrowserBundledState';
import { useGoogleTtsState } from '@view/settings/TextToSpeech/useGoogleTtsState';

export default function Playground() {
  const form = useFormInstance();
  const { speechService } = useTtsState();
  const [text, setText] = useState(form.getFieldValue('speech_example'));
  const { voiceURI } = useBrowserBundledState();
  const { speak: speakGoogleTts } = useGoogleTtsState();

  const onInput = (e: FormEvent) => {
    setText(e.currentTarget.textContent);
  };

  const speak = () => {
    if (speechService === SpeechService.system) {
      systemTts(voiceURI, text);
    } else {
      speakGoogleTts(text);
    }
  };
  return (
    <>
      <h4>Voice sample</h4>
      <Form.Item name="speech_example">
        <Input.TextArea rows={4} placeholder="Please enter a text" onInput={onInput} />
      </Form.Item>
      <div style={{ margin: '-20px 0 0 196px' }}>
        <Button type="primary" onClick={speak} name="">
          SPEAK IT
        </Button>
      </div>
    </>
  );
}

function systemTts(voiceURI: string, txt: string) {
  const utterance = new SpeechSynthesisUtterance(txt);
  const voices = speechSynthesis.getVoices();
  let voice = voices.find((voice) => voice.voiceURI === voiceURI);
  if (!voice) {
    voice = voices.find((voice) => voice.lang === 'en-US');
  }
  utterance.voice = voice!;
  utterance.lang = voice!.lang;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}
