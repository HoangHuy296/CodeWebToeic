package com.ivyts.backend.relational.wordcheck;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface WordItemJpaRepository extends JpaRepository<WordItemEntity, String> {

    List<WordItemEntity> findBySetSlugOrderBySortOrderAsc(String setSlug);

    // Native (not JPQL): chapters are shown grouped by course, in curriculum order
    // (course_order, then set_order) — never alphabetically ("Chapter 10" < "Chapter 2").
    @Query(
        value = "select set_slug as setSlug, set_name as setName, course_slug as courseSlug, "
            + "course_name as courseName, count(*) as itemCount "
            + "from word_items "
            + "group by set_slug, set_name, course_slug, course_name, course_order, set_order "
            + "order by course_order, set_order, set_slug",
        nativeQuery = true
    )
    List<SetCount> countBySet();

    interface SetCount {
        String getSetSlug();

        String getSetName();

        String getCourseSlug();

        String getCourseName();

        long getItemCount();
    }
}
