import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList, TextInput, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, ChevronRight, Target, Clock, Star, Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { drills, Drill, getDrillsByCategory, searchDrills } from '@/constants/drills';
import colors from '@/constants/colors';
import theme from '@/constants/theme';
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const drillCategories = [
  { id: 'shooting', name: 'Shooting', icon: '🏀', gradient: [colors.primary, colors.primaryLight] as const },
  { id: 'dribbling', name: 'Dribbling', icon: '⚡', gradient: [colors.warning, colors.warningLight] as const },
  { id: 'passing', name: 'Passing', icon: '🤝', gradient: [colors.info, colors.infoLight] as const },
  { id: 'conditioning', name: 'Conditioning', icon: '💪', gradient: [colors.success, colors.successLight] as const },
  { id: 'recovery', name: 'Recovery', icon: '🧘', gradient: [colors.accent.purple, colors.accent.pink] as const },
];

const difficultyColors = {
  beginner: colors.success,
  intermediate: colors.warning,
  advanced: colors.error,
};

export default function DrillsLibraryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialCategory = typeof params.category === 'string' ? params.category : null;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDrills, setFilteredDrills] = useState<Drill[]>(drills);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);

  useEffect(() => {
    filterDrills();
  }, [selectedCategory, searchQuery, selectedDifficulties]);

  const filterDrills = () => {
    let filtered = drills;

    // Filter by category
    if (selectedCategory) {
      filtered = getDrillsByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = searchDrills(searchQuery);
      if (selectedCategory) {
        filtered = filtered.filter(drill => drill.category === selectedCategory);
      }
    }

    // Filter by difficulty
    if (selectedDifficulties.length > 0) {
      filtered = filtered.filter(drill => selectedDifficulties.includes(drill.difficulty));
    }

    setFilteredDrills(filtered);
  };

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setSelectedDifficulties([]);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderDrillCard = ({ item }: { item: Drill }) => (
    <TouchableOpacity
      style={styles.drillCard}
      onPress={() => router.push(`/drill-practice?drillId=${item.id}`)}
    >
      <View style={styles.drillHeader}>
        <View style={styles.drillTitleContainer}>
          <Text style={styles.drillName}>{item.name}</Text>
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyColors[item.difficulty] }]}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => router.push(`/drill-practice?drillId=${item.id}`)}
        >
          <Play size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.drillDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.drillFooter}>
        <View style={styles.drillStats}>
          <View style={styles.statItem}>
            <Clock size={16} color={colors.gray[500]} />
            <Text style={styles.statText}>{formatDuration(item.duration)}</Text>
          </View>
          <View style={styles.statItem}>
            <Target size={16} color={colors.gray[500]} />
            <Text style={styles.statText}>{item.muscle_groups.length} muscles</Text>
          </View>
        </View>
        <ChevronRight size={20} color={colors.gray[400]} />
      </View>
    </TouchableOpacity>
  );

  const renderCategoryCard = ({ item }: { item: typeof drillCategories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.selectedCategoryCard
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
    >
      <LinearGradient
        colors={item.gradient}
        style={styles.categoryGradient}
      >
        <Text style={styles.categoryIcon}>{item.icon}</Text>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryCount}>
          {getDrillsByCategory(item.id).length} drills
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.warning, colors.warning + 'CC', colors.background]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Drills Library</Text>
        <Text style={styles.headerSubtitle}>Master your basketball skills</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.gray[500]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search drills..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.gray[500]}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={drillCategories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Filters */}
        <View style={styles.section}>
          <View style={styles.filterHeader}>
            <Text style={styles.sectionTitle}>Difficulty</Text>
            {(selectedCategory || searchQuery || selectedDifficulties.length > 0) && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearFiltersText}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.difficultyFilters}>
            {(['beginner', 'intermediate', 'advanced'] as const).map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.difficultyFilter,
                  selectedDifficulties.includes(difficulty) && styles.selectedDifficultyFilter,
                  { borderColor: difficultyColors[difficulty] }
                ]}
                onPress={() => toggleDifficulty(difficulty)}
              >
                <Text style={[
                  styles.difficultyFilterText,
                  selectedDifficulties.includes(difficulty) && { color: difficultyColors[difficulty] }
                ]}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Results */}
        <View style={styles.section}>
          <View style={styles.resultsHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory ? `${drillCategories.find(c => c.id === selectedCategory)?.name} Drills` : 'All Drills'}
            </Text>
            <Text style={styles.resultsCount}>{filteredDrills.length} drills</Text>
          </View>
          
          {filteredDrills.length > 0 ? (
            <View style={styles.drillsList}>
              {filteredDrills.map((drill) => (
                <View key={drill.id}>
                  {renderDrillCard({ item: drill })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No drills found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your filters or search terms
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: colors.text,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryCard: {
    width: 120,
    height: 100,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedCategoryCard: {
    transform: [{ scale: 1.05 }],
  },
  categoryGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  clearFiltersText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  difficultyFilters: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.gray[300],
  },
  selectedDifficultyFilter: {
    backgroundColor: colors.backgroundLight,
  },
  difficultyFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.gray[600],
  },
  drillsList: {
    gap: 15,
  },
  drillCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  drillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  drillTitleContainer: {
    flex: 1,
  },
  drillName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  playButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  drillDescription: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
    marginBottom: 15,
  },
  drillFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drillStats: {
    flexDirection: 'row',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[600],
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  filterCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
}); 