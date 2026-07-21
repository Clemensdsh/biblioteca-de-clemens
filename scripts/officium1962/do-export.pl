#!/usr/bin/env perl
use utf8;
use strict;
use warnings;
use FindBin qw($Bin);
use File::Spec;
use Getopt::Long qw(GetOptions);
use JSON::PP;
use CGI;
use POSIX qw(floor);

binmode(STDOUT, ':raw');
binmode(STDERR, ':encoding(utf-8)');

my $date = '';
my $hour = 'Completorium';
my $hours = '';
my $requested_version = 'Rubrics 1960 - 1960';
my $language = 'Latin';
my $upstream = File::Spec->rel2abs(File::Spec->catdir($Bin, '..', '..', 'vendor', 'divinum-officium'));
my $commit = '';

GetOptions(
  'date=s' => \$date,
  'hour=s' => \$hour,
  'hours=s' => \$hours,
  'version=s' => \$requested_version,
  'language=s' => \$language,
  'upstream=s' => \$upstream,
  'commit=s' => \$commit,
) or die "Invalid options\n";

die "--date is required\n" unless $date =~ /^\d{4}-\d{2}-\d{2}$/;
die "Only Latin is supported in this exporter\n" unless $language eq 'Latin';
die "Only Rubrics 1960 - 1960 is supported in this exporter\n" unless $requested_version eq 'Rubrics 1960 - 1960';

my %hour_map = (
  matutinum => 'Matutinum',
  laudes => 'Laudes',
  prima => 'Prima',
  tertia => 'Tertia',
  sexta => 'Sexta',
  nona => 'Nona',
  vesperae => 'Vesperae',
  completorium => 'Completorium',
);

my @requested_hours = $hours
  ? map { s/^\s+|\s+$//gr } split /,/, $hours
  : ($hour);
my @canonical_hours = map { $hour_map{lc($_)} || die "Unsupported hour: $_\n" } @requested_hours;
my $canonical_hour = $canonical_hours[0];
my ($yyyy, $mm, $dd) = split /-/, $date;
my $do_date = int($mm) . '-' . int($dd) . '-' . int($yyyy);

my $cgi_root = File::Spec->catdir($upstream, 'web', 'cgi-bin');
my $horas_root = File::Spec->catdir($cgi_root, 'horas');
unshift @INC, $cgi_root;
unshift @INC, $horas_root;
$Bin = $horas_root;

package main;
require DivinumOfficium::Main;
DivinumOfficium::Main->import(qw(liturgical_color));
require DivinumOfficium::Date;
DivinumOfficium::Date->import(qw(prevnext date_to_days days_to_date));
require DivinumOfficium::LanguageTextTools;
DivinumOfficium::LanguageTextTools->import(
  qw(prayer rubric prex translate load_languages_data omit_regexp suppress_alleluia process_inline_alleluias alleluia_ant ensure_single_alleluia ensure_double_alleluia)
);
require DivinumOfficium::Lexicon;
DivinumOfficium::Lexicon->import(qw(apply_interlinear));

our $q = CGI->new('');
our $error = '';
our $debug = '';
our $Ck = 0;
our $missa = 0;
our $officium = 'Pofficium.pl';
our $version = $requested_version;
our $lang1 = $language;
our $lang2 = $language;
our $langfb = 'English';
our $expand = 'tota';
our $votive = 'Hodie';
our $column = 1;
our $local = 0;
our $dioecesis = 'Generale';
our $content = 1;
our $caller = '';
our $buildscript = '';
our $searchvalue = '0';
our $expandind = 0;
our $plures = '';
our $hora = $canonical_hour;
our $only = 1;
our $date1 = $do_date;
our $command = "pray$canonical_hour";
our %winner;

require File::Spec->catfile($cgi_root, 'DivinumOfficium', 'SetupString.pl');
require File::Spec->catfile($horas_root, 'horascommon.pl');
require File::Spec->catfile($cgi_root, 'DivinumOfficium', 'dialogcommon.pl');
require File::Spec->catfile($horas_root, 'webdia.pl');
require File::Spec->catfile($cgi_root, 'DivinumOfficium', 'setup.pl');
require File::Spec->catfile($horas_root, 'horas.pl');
require File::Spec->catfile($horas_root, 'horasscripts.pl');
require File::Spec->catfile($horas_root, 'specials.pl');
require File::Spec->catfile($horas_root, 'specmatins.pl');
require File::Spec->catfile($horas_root, 'monastic.pl');
require File::Spec->catfile($horas_root, 'altovadum.pl');
require File::Spec->catfile($horas_root, 'horasjs.pl');

getini('horas');
loadsetup('');
load_languages_data($lang1, $lang2, $langfb, $version, $missa);
precedence($date1);
setsecondcol();

my %exports;
for my $current_hour (@canonical_hours) {
  $hora = $current_hour;
  $command = "pray$current_hour";
  $exports{lc($current_hour)} = export_hour($current_hour);
}

my $json = JSON::PP->new->utf8(1)->canonical(1);
if ($hours) {
  print $json->encode({
    schemaVersion => '0.1.0',
    date => $date,
    upstreamCommit => $commit,
    hours => \%exports,
  }) . "\n";
}
else {
  print $json->encode($exports{lc($canonical_hour)}) . "\n";
}

sub export_hour {
  my ($current_hour) = @_;
  my $headline = setheadline();
  my @script = specials([getordinarium($lang1, $current_hour)], $lang1);
  my @units;
  my $index = 0;
  my $unit_index = 0;
  while ($index < @script) {
    my ($raw, $next_index) = getunit(\@script, $index);
    $index = $next_index;
    next unless defined $raw && $raw =~ /\S/;
    my $resolved = resolve_refs($raw, $lang1);
    push @units, {
      id => sprintf('do-1962-%s-%s-%03d', $date, lc($current_hour), ++$unit_index),
      raw => normalize_text($raw),
      html => normalize_text($resolved),
    };
  }

  my $rank_value = '';
  $rank_value = $winner{Rank} if %winner && exists $winner{Rank};

  return {
    schemaVersion => '0.1.0',
    engineVersion => $requested_version,
    language => 'la',
    date => $date,
    hour => lc($current_hour),
    liturgicalTitle => normalize_text($headline),
    rank => normalize_text($rank_value),
    upstreamCommit => $commit,
    sourceRefs => [{
      upstreamCommit => $commit,
      path => 'web/cgi-bin/horas/horas.pl',
      section => 'getordinarium/specials/getunit/resolve_refs',
      transformation => ['Divinum Officium internal script array exported before print_content'],
    }],
    warnings => ($error ? [{ code => 'upstream-error-text', message => normalize_text($error) }] : []),
    units => \@units,
  };
}

sub normalize_text {
  my ($value) = @_;
  return '' unless defined $value;
  $value =~ s/\r\n?/\n/g;
  $value =~ s/[ \t]+$//mg;
  $value =~ s/\n{3,}/\n\n/g;
  return $value;
}
