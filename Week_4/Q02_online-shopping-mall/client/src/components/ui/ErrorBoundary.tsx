import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-extrabold text-coupang-blue">앗!</h1>
            <p className="mt-4 text-lg text-gray-600">예상치 못한 오류가 발생했습니다</p>
            <p className="mt-1 text-sm text-gray-400">잠시 후 다시 시도해주세요</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                다시 시도
              </button>
              <Link
                to="/"
                className="rounded-lg bg-coupang-blue px-6 py-2 text-sm font-medium text-white hover:bg-blue-600"
                onClick={() => this.setState({ hasError: false })}
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
