/**
 * 홈(/) — 채널을 아직 선택하지 않은 상태.
 *
 * 모바일: 사이드바가 풀스크린으로 노출되므로 이 페이지 자체는 거의 보이지 않음
 *        (MobileNavWrapper 가 메인 영역을 숨김).
 * 데스크탑: 사이드바 + 이 환영 메시지가 함께 보임.
 */
export default function AppHomePage() {
  return (
    <div className="flex h-full items-center justify-center px-6 py-12 text-center">
      <div className="max-w-md">
        <h2 className="text-lg font-semibold text-zinc-900">
          Slack 아카이브
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          좌측에서 채널을 선택하거나 상단에서 검색하세요.
        </p>
      </div>
    </div>
  )
}
