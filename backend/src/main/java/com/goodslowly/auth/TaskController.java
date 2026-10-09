package com.goodslowly.auth;

import java.util.List;
import java.util.Optional;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

	private final AppUserRepository users;
	private final UserTaskRepository tasks;

	public TaskController(AppUserRepository users, UserTaskRepository tasks) {
		this.users = users;
		this.tasks = tasks;
	}

	@GetMapping
	public ResponseEntity<?> list(HttpServletRequest request) {
		Optional<Long> userId = SessionAuth.userId(request);
		if (userId.isEmpty()) {
			return unauthorized();
		}

		List<TaskResponse> result = tasks.findAllByUser_IdOrderByIdAsc(userId.get())
				.stream()
				.map(TaskResponse::from)
				.toList();
		return ResponseEntity.ok(result);
	}

	@PostMapping
	public ResponseEntity<?> create(
			@Valid @RequestBody CreateTaskRequest input,
			HttpServletRequest request) {
		Optional<AppUser> user = authenticatedUser(request);
		if (user.isEmpty()) {
			return unauthorized();
		}

		UserTask task = tasks.save(new UserTask(input.title().trim(), user.get()));
		return ResponseEntity.status(HttpStatus.CREATED).body(TaskResponse.from(task));
	}

	@PatchMapping("/{taskId}")
	public ResponseEntity<?> update(
			@PathVariable Long taskId,
			@Valid @RequestBody UpdateTaskRequest input,
			HttpServletRequest request) {
		Optional<Long> userId = SessionAuth.userId(request);
		if (userId.isEmpty()) {
			return unauthorized();
		}

		return tasks.findByIdAndUser_Id(taskId, userId.get())
				.<ResponseEntity<?>>map(task -> {
					task.setDone(input.done());
					return ResponseEntity.ok(TaskResponse.from(tasks.save(task)));
				})
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@DeleteMapping("/{taskId}")
	public ResponseEntity<?> delete(@PathVariable Long taskId, HttpServletRequest request) {
		Optional<Long> userId = SessionAuth.userId(request);
		if (userId.isEmpty()) {
			return unauthorized();
		}

		return tasks.findByIdAndUser_Id(taskId, userId.get())
				.<ResponseEntity<?>>map(task -> {
					tasks.delete(task);
					return ResponseEntity.noContent().build();
				})
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	private Optional<AppUser> authenticatedUser(HttpServletRequest request) {
		return SessionAuth.userId(request).flatMap(users::findById);
	}

	private ResponseEntity<AuthController.ApiMessage> unauthorized() {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(new AuthController.ApiMessage("Please sign in to continue."));
	}

	public record CreateTaskRequest(@NotBlank @Size(max = 120) String title) {
	}

	public record UpdateTaskRequest(@NotNull Boolean done) {
	}

	public record TaskResponse(Long id, String title, boolean done, java.time.Instant createdAt) {
		static TaskResponse from(UserTask task) {
			return new TaskResponse(task.getId(), task.getTitle(), task.isDone(), task.getCreatedAt());
		}
	}
}