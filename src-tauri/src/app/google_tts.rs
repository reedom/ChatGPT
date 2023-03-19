use crate::conf::AppConf;
use google_cognitive_apis::api::grpc::google::cloud::texttospeech::v1::{
  synthesis_input::InputSource, AudioConfig, AudioEncoding, ListVoicesRequest, ListVoicesResponse,
  SynthesisInput, SynthesizeSpeechRequest, VoiceSelectionParams,
};
use google_cognitive_apis::texttospeech::synthesizer::Synthesizer;
use log::error;
use rodio::{Decoder, OutputStream, Sink};
use std::io::Cursor;
use tauri::{command, AppHandle};

#[command]
pub async fn google_validate_credential(_app: AppHandle, text: String) -> bool {
  let res = Synthesizer::create(text).await;
  return !res.is_err();
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct GoogleTtsVoice {
  pub name: String,
  pub language_codes: Vec<String>,
  pub gender: i32,
}

#[command]
pub async fn google_text_to_speech_voices(_app: AppHandle) -> Option<Vec<GoogleTtsVoice>> {
  let app_conf = AppConf::read();
  match Synthesizer::create(app_conf.google_cred).await {
    Ok(mut synthesizer) => {
      let voices_resp: ListVoicesResponse = synthesizer
        .list_voices(ListVoicesRequest {
          language_code: "en".to_string(),
        })
        .await
        .unwrap();

      let mut list = vec![];
      for voice in voices_resp.voices {
        let google_voice = GoogleTtsVoice {
          name: voice.name,
          language_codes: voice.language_codes,
          gender: voice.ssml_gender,
        };
        list.push(google_voice);
      }
      return Some(list);
    }
    Err(err) => {
      error!("failed to list up voices: {:?}", err);
      return None;
    }
  }
}

#[command]
pub async fn google_text_to_speech(_app: AppHandle, text: String, name: Option<String>) -> bool {
  let app_conf = AppConf::read();
  let res = Synthesizer::create(app_conf.google_cred).await;
  if res.is_err() {
    error!(
      "failed to activate the tts service: {:?}",
      res.err().unwrap()
    );
    return false;
  }

  let mut synthesizer = res.unwrap();
  let name = name.unwrap_or(app_conf.google_speech_name);
  let response = synthesizer
    .synthesize_speech(SynthesizeSpeechRequest {
      input: Some(SynthesisInput {
        input_source: Some(InputSource::Text(text)),
      }),
      voice: Some(VoiceSelectionParams {
        language_code: "en".to_string(),
        name: name.to_owned(),
        ssml_gender: app_conf.google_speech_gender,
      }),
      audio_config: Some(AudioConfig {
        audio_encoding: AudioEncoding::Linear16 as i32,
        speaking_rate: 1f64,
        pitch: 0f64,
        volume_gain_db: 0f64,
        sample_rate_hertz: 16000,
        effects_profile_id: vec![],
      }),
    })
    .await
    .unwrap();

  let cursor = Cursor::new(response.audio_content);
  let source = Decoder::new(cursor).unwrap();
  let (_stream, stream_handle) = OutputStream::try_default().unwrap();
  let sink = Sink::try_new(&stream_handle).unwrap();
  sink.append(source);
  sink.sleep_until_end();
  true
}
