package com.goodslowly.auth;

import java.util.Locale;
import java.util.Optional;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private static final int SESSION_SECONDS = 30 * 60;
	private static final int REMEMBERED_SESSION_SECONDS = 14 * 24 * 60 * 60;

	private final AppUserRepository users;
	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public AuthController(AppUserRepository users) {
		this.users = users;
	}

	@PostMapping("/register")
	public ResponseEntity<?> register(
			@Valid @RequestBody Credentials credentials,
			HttpServletRequest request) {
		String email = normalizeEmail(credentials.email());
		if (users.existsByEmail(email)) {
			return ResponseEntity.status(HttpStatus.CONFLICT)
					.body(new ApiMessage("An account with this email already exists."));
		}

		AppUser user = users.save(new AppUser(email, passwordEncoder.encode(credentials.password())));
		startSession(request, user, credentials.rememberMe());
		return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(user));
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(
			@Valid @RequestBody Credentials credentials,
			HttpServletRequest request) {
		Optional<AppUser> matchingUser = users.findByEmail(normalizeEmail(credentials.email()))
				.filter(user -> passwordEncoder.matches(credentials.password(), user.getPasswordHash()));

		if (matchingUser.isEmpty()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(new ApiMessage("Email or password is incorrect."));
		}

		AppUser user = matchingUser.get();
		startSession(request, user, credentials.rememberMe());
		return ResponseEntity.ok(UserResponse.from(user));
	}

	@GetMapping("/me")
	public ResponseEntity<?> currentUser(HttpServletRequest request) {
		return SessionAuth.userId(request)
				.flatMap(users::findById)
				.<ResponseEntity<?>>map(user -> ResponseEntity.ok(UserResponse.from(user)))
				.orElseGet(this::unauthorized);
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.invalidate();
		}
		return ResponseEntity.noContent().build();
	}

	private void startSession(HttpServletRequest request, AppUser user, boolean rememberMe) {
		HttpSession previousSession = request.getSession(false);
		if (previousSession != null) {
			previousSession.invalidate();
		}
		HttpSession session = request.getSession(true);
		SessionAuth.setUserId(session, user.getId());
		session.setMaxInactiveInterval(rememberMe ? REMEMBERED_SESSION_SECONDS : SESSION_SECONDS);
	}

	private ResponseEntity<?> unauthorized() {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(new ApiMessage("Please sign in to continue."));
	}

	private static String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	public record Credentials(
			@NotBlank @Email @Size(max = 254) String email,
			@NotBlank @Size(min = 8, max = 72) String password,
			boolean rememberMe) {
	}

	public record UserResponse(Long id, String email) {
		static UserResponse from(AppUser user) {
			return new UserResponse(user.getId(), user.getEmail());
		}
	}

	public record ApiMessage(String message) {
	}
}