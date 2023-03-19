import { Select, Tag } from 'antd';
import { Gender, useGoogleTtsState } from './useGoogleTtsState';
import { SpeechService, useTtsState } from '@view/settings/TextToSpeech/useTtsState';

export default function GoogleTtsVoices() {
  const { setSpeechService } = useTtsState();
  const { voices, selectedName, setSelectedName } = useGoogleTtsState();

  return (
    <Select
      style={{ width: 300 }}
      disabled={!voices}
      onSelect={(name: string) => {
        setSpeechService(SpeechService.google);
        setSelectedName(name);
      }}
      defaultValue={selectedName}
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
  );
}
