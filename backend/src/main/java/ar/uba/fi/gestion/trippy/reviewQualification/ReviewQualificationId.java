package ar.uba.fi.gestion.trippy.reviewQualification;

import java.io.Serializable;
import java.util.Objects;

public class ReviewQualificationId implements Serializable {
  private Long review;      // Must match field name in entity
  private Long qualifier;   // Must match field name in entity

  public ReviewQualificationId() {}

  public ReviewQualificationId(Long review, Long qualifier) {
    this.review = review;
    this.qualifier = qualifier;
  }

  public Long getReview() { return review; }
  public void setReview(Long review) { this.review = review; }

  public Long getQualifier() { return qualifier; }
  public void setQualifier(Long qualifier) { this.qualifier = qualifier; }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    ReviewQualificationId that = (ReviewQualificationId) o;
    return Objects.equals(review, that.review) &&
            Objects.equals(qualifier, that.qualifier);
  }

  @Override
  public int hashCode() {
    return Objects.hash(review, qualifier);
  }
}
