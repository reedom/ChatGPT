import { Alert, Radio, RadioChangeEvent, Typography } from 'antd';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';
import BrowserBundledVoices from './BrowserBundledVoices';
import GoogleTtsVoices, { LoadCredentialButton } from '@view/settings/TextToSpeech/GoogleTtsVoices';
import { GoogleTtsStateProvider, useGoogleTtsState } from './useGoogleTtsState';
import {
  SpeechService,
  TtsStateProvider,
  useTtsState,
} from '@view/settings/TextToSpeech/useTtsState';

export default function TextToSpeech() {
  return (
    <TtsStateProvider>
      <GoogleTtsStateProvider>
        <Component />
      </GoogleTtsStateProvider>
    </TtsStateProvider>
  );
}

function Component() {
  const form = useFormInstance();
  const { enabledGoogleTts, hasNewCredential } = useGoogleTtsState();
  const { speechService, setSpeechService } = useTtsState();

  const onChange = (e: RadioChangeEvent) => {
    setSpeechService(e.target.value);
    form.setFieldValue('speech_service', e.target.value);
  };

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
        <div style={{ padding: '12px 0 0 12px' }}>
          <GoogleTtsVoices />
        </div>
      </Radio.Group>
      {!enabledGoogleTts && (
        <div style={{ padding: '12px 0 0 4px' }}>
          <Typography.Text italic>
            To use Google Cloud Text-to-Speech service, fetch a GCP credential JSON and set it
            below.
            <br />
            (the credential file will be stored locally. Only used for the Text-to-Speech service
            and never been uploaded anywhere.)
          </Typography.Text>
        </div>
      )}
      <div style={{ padding: '12px 0 4px' }}>
        <LoadCredentialButton />
      </div>
      {hasNewCredential && (
        <Alert
          style={{ marginBottom: '20px' }}
          description={'Please press the Submit button to use the new credential.'}
          type="warning"
          showIcon
        />
      )}
    </>
  );
}
