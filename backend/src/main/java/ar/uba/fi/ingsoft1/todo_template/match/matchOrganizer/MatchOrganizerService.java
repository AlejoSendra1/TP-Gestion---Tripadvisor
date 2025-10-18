package ar.uba.fi.ingsoft1.todo_template.match.matchOrganizer;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Transactional
public class MatchOrganizerService {

    MatchOrganizerRepository matchOrganizerRepository;

    MatchOrganizerService(MatchOrganizerRepository matchOrganizerRepository) {
        this.matchOrganizerRepository = matchOrganizerRepository;
    }

    public MatchOrganizerDTO getMatchPlayers(Long matchId){
        return new MatchOrganizerDTO(getMatchOrganizer(matchId));
    }

    public void create(){
        matchOrganizerRepository.save(new MatchOrganizer());
    }

    public void addPlayer(Long id, Long playerId){
        MatchOrganizer matchOrganizer = getMatchOrganizer(id);
        matchOrganizer.addPlayer(playerId);
        matchOrganizerRepository.save(matchOrganizer);
    }

    public void removePlayer(Long id, Long playerId){
        MatchOrganizer matchOrganizer = getMatchOrganizer(id);
        matchOrganizer.removePlayer(playerId);
        matchOrganizerRepository.save(matchOrganizer);
    }

    public MatchOrganizerDTO movePlayer(Long matchId, Long playerId, Short team){
        MatchOrganizer matchOrganizer = getMatchOrganizer(matchId);
        matchOrganizer.movePlayer(playerId, team);
        matchOrganizerRepository.save(matchOrganizer);
        return new MatchOrganizerDTO(matchOrganizer);
    }

    public MatchOrganizerDTO finish(Long matchId){
        MatchOrganizer matchOrganizer = getMatchOrganizer(matchId);
        matchOrganizer.finish();
        return new MatchOrganizerDTO(matchOrganizer);
    }

    public MatchOrganizerDTO generateMatchTeams(Long matchId){
        MatchOrganizer matchOrganizer = getMatchOrganizer(matchId);
        matchOrganizer.generateRandomTeams();
        matchOrganizerRepository.save(matchOrganizer);
        return new MatchOrganizerDTO(matchOrganizer);
    }

    private MatchOrganizer getMatchOrganizer(Long matchId){
        Optional<MatchOrganizer> possibleMatchOrganizer = matchOrganizerRepository.findById(matchId);
        if (possibleMatchOrganizer.isEmpty()){
            throw new EntityNotFoundException("Match not found");
        }
        return possibleMatchOrganizer.get();
    }
}
