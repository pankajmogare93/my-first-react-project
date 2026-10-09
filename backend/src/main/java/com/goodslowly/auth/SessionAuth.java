package com.goodslowly.auth;

import java.util.Optional;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

final class SessionAuth {

	private static final String USER_ID_ATTRIBUTE = "authenticatedUserId";

	private SessionAuth() {
	}

	static Optional<Long> userId(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session == null || !(session.getAttribute(USER_ID_ATTRIBUTE) instanceof Long userId)) {
			return Optional.empty();
		}
		return Optional.of(userId);
	}

	static void setUserId(HttpSession session, Long userId) {
		session.setAttribute(USER_ID_ATTRIBUTE, userId);
	}
}