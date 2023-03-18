use google_cognitive_apis::api::grpc::google::cloud::texttospeech::v1::{
  synthesis_input::InputSource, AudioConfig, AudioEncoding, ListVoicesRequest, ListVoicesResponse,
  SynthesisInput, SynthesizeSpeechRequest, VoiceSelectionParams,
};
use google_cognitive_apis::texttospeech::synthesizer::Synthesizer;
use log::info;
use rodio::{Decoder, OutputStream, Sink};
use std::io::Cursor;
use tauri::{command, AppHandle};

#[command]
pub async fn google_text_to_speech(_app: AppHandle, text: String) -> bool {
  info!("google_text_to_speech start!");
  info!("google_text_to_speech text: {}", text);
  // let credentials = fs::read_to_string("/tmp/cred.json").unwrap();
  let credentials = r##"
"##;

  let mut synthesizer = Synthesizer::create(credentials).await.unwrap();

  let voices_resp: ListVoicesResponse = synthesizer
    .list_voices(ListVoicesRequest {
      language_code: "en".to_string(),
    })
    .await
    .unwrap();

  let voice1 = &voices_resp.voices[0];

  let response = synthesizer
    .synthesize_speech(SynthesizeSpeechRequest {
      input: Some(SynthesisInput {
        input_source: Some(InputSource::Text(text)),
      }),
      voice: Some(VoiceSelectionParams {
        language_code: "en".to_string(),
        name: voice1.name.to_owned(),
        ssml_gender: voice1.ssml_gender,
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
