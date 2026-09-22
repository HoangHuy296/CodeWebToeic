package com.ivyts.backend.relational.wordcheck;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface WordItemJpaRepository extends JpaRepository<WordItemEntity, String> {

    List<WordItemEntity> findBySetSlugOrderBySortOrderAsc(String setSlug);

    // Native (not JPQL): set_name sorts as text ("Starter 10" < "Starter 2"), so this orders by
    // the numeric suffix of set_slug ("starter-N") instead, for the natural 1, 2, 3... order.
    @Query(
        value = "select set_slug as setSlug, set_name as setName, count(*) as itemCount "
            + "from word_items group by set_slug, set_name "
            + "order by cast(substring_index(set_slug, '-', -1) as unsigned), set_name",
        nativeQuery = true
    )
    List<SetCount> countBySet();

    interface SetCount {
        String getSetSlug();

        String getSetName();

        long getItemCount();
    }
}
