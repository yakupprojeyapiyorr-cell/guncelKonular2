package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.Friend;
import com.tezprojesi.api.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FriendRepository extends JpaRepository<Friend, UUID> {
    List<Friend> findByRequesterAndStatus(User requester, Friend.FriendshipStatus status);
    List<Friend> findByReceiverAndStatus(User receiver, Friend.FriendshipStatus status);
    
    @Query("SELECT f FROM Friend f WHERE (f.requester = :user OR f.receiver = :user) AND f.status = 'ACCEPTED'")
    List<Friend> findFriendsOfUser(User user);
    
    Optional<Friend> findByRequesterAndReceiver(User requester, User receiver);
}
