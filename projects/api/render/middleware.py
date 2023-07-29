class SecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"  # Googleの推奨に従った設定
        response["Referrer-Policy"] = "no-referrer-when-downgrade"  # Googleの推奨に従った設定
        return response