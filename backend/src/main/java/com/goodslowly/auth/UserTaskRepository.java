package com.goodslowly.auth;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserTaskRepository extends JpaRepository<UserTask, Long> {

	List<UserTask> findAllByUser_IdOrderByIdAsc(Long userId);

	Optional<UserTask> findByIdAndUser_Id(Long taskId, Long userId);
}