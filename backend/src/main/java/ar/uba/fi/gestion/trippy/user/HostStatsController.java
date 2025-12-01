// java
package ar.uba.fi.gestion.trippy.user;

import ar.uba.fi.gestion.trippy.user.dto.HostStatsDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hosts")
@Tag(name = "Hosts")
public class HostStatsController {
    private final HostStatsService hostStatsService;

    public HostStatsController(HostStatsService hostStatsService) {
        this.hostStatsService = hostStatsService;
    }

    @GetMapping("/{ownerEmail}/stats")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener estadísticas de un host: promedio de reseñas, ingreso confirmado y publicación con más ingreso")
    public ResponseEntity<HostStatsDTO> getHostStats(@PathVariable("ownerEmail") String ownerEmail) {
        HostStatsDTO stats = hostStatsService.getStatsForOwner(ownerEmail);
        return ResponseEntity.ok(stats);
    }
}
