package ar.uba.fi.gestion.trippy.publication;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, Long> {
    // ¡Y ya está!
    // findAll() te devolverá una List<Publication> con Alojamientos, Restaurantes, etc.
    // findById(id) funcionará perfecto.
}