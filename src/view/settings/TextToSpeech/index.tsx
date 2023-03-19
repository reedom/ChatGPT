import { Alert, Radio, RadioChangeEvent, Typography } from 'antd';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';
import { open } from '@tauri-apps/api/shell';
import BrowserBundledVoices from './BrowserBundledVoices';
import GoogleTtsVoices from '@view/settings/TextToSpeech/GoogleTtsVoices';
import { GoogleTtsStateProvider, useGoogleTtsState } from './useGoogleTtsState';
import {
  SpeechService,
  TtsStateProvider,
  useTtsState,
} from '@view/settings/TextToSpeech/useTtsState';
import Playground from '@view/settings/TextToSpeech/Playground';
import { BrowserBundledProvider } from '@view/settings/TextToSpeech/useBrowserBundledState';

export default function TextToSpeech() {
  return (
    <TtsStateProvider>
      <BrowserBundledProvider>
        <GoogleTtsStateProvider>
          <Component />
        </GoogleTtsStateProvider>
      </BrowserBundledProvider>
    </TtsStateProvider>
  );
}

function Component() {
  const form = useFormInstance();
  const { enabledGoogleTts, hasNewCredential, loadCredential } = useGoogleTtsState();
  const { speechService, setSpeechService } = useTtsState();

  const onChange = (e: RadioChangeEvent) => {
    setSpeechService(e.target.value);
    form.setFieldValue('speech_service', e.target.value);
  };

  const openTtsTutorial = () =>
    open(
      'https://console.cloud.google.com/welcome?walkthrough_id=text-to-speech--text-to-speech-nodejs',
    );

  return (
    <>
      <Radio.Group onChange={onChange} value={speechService}>
        <Radio value={SpeechService.system}>Browser bundled</Radio>
        <div style={{ padding: '12px 0 0 12px' }}>
          <BrowserBundledVoices />
        </div>
        <Radio value={SpeechService.google} disabled={!enabledGoogleTts}>
          Google Cloud Text-to-Speech
        </Radio>
        <div style={{ padding: '12px 0 0 24px' }}>
          <GoogleTtsVoices />
        </div>
      </Radio.Group>
      {!enabledGoogleTts && (
        <div style={{ padding: '12px 0 0 14px' }}>
          <Typography.Text italic>
            To use Google Cloud Text-to-Speech service,{' '}
            <a onClick={openTtsTutorial}>generate a GCP credential JSON for it</a> and{' '}
            <a onClick={loadCredential}>set the JSON by clicking here</a>.
            <br />
            (the credential file will be stored locally. Only used for the Text-to-Speech service
            and never been uploaded anywhere.)
          </Typography.Text>
        </div>
      )}
      <Playground />
      {hasNewCredential && (
        <Alert
          style={{ marginBottom: '20px' }}
          description={'Please press the Submit button to use the new credential.'}
          type="warning"
          showIcon
        />
      )}
      <div style={{ padding: '12px' }} />
    </>
  );
}
